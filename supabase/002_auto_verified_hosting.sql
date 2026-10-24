-- SympoConnect upgrade: "Host an Event" with automatic college-email verification.
-- Run ONCE in Supabase Dashboard > SQL Editor, after schema.sql (works on fresh and existing projects).
--
-- Trust rule (enforced here, never in the browser): an event is published instantly when the submitter
--   1. has a confirmed email whose domain ends in .edu.in / .ac.in or is listed in verified_college_domains, and
--   2. proved ownership of that inbox in the current session (email OTP / magic link / signup confirmation).
-- Everyone else still lands in the staff review queue as before.

-- ---------- NEW EVENT FIELDS ----------
alter table events add column if not exists event_time time;
alter table events add column if not exists social_url text
  check (social_url is null or social_url ~* '^https?://[^\s]+$');
alter table events add column if not exists verified_via text
  check (verified_via is null or verified_via in ('staff','college_email'));
alter table events add column if not exists verified_domain text;
update events set verified_via = 'staff' where status = 'approved' and verified_via is null and reviewed_by is not null;

insert into event_categories (name, icon) values ('Competition','🏆') on conflict (name) do nothing;

-- ---------- ADMIN-MANAGED COLLEGE DOMAINS (for colleges not on .edu.in / .ac.in) ----------
create table if not exists verified_college_domains (
  domain text primary key check (domain ~ '^[a-z0-9-]+(\.[a-z0-9-]+)+$'),
  college_name text check (char_length(college_name) <= 150),
  added_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table verified_college_domains enable row level security;
drop policy if exists "domains: public read" on verified_college_domains;
drop policy if exists "domains: admin write" on verified_college_domains;
create policy "domains: public read" on verified_college_domains for select using (true);
create policy "domains: admin write" on verified_college_domains for all using (public.is_admin()) with check (public.is_admin());

-- ---------- TRUST HELPERS ----------
create or replace function public.college_domain_of(p_email text) returns text language sql stable security definer set search_path = public as $$
  select case when d ~ '\.(edu|ac)\.in$'
              or exists (select 1 from verified_college_domains v where d = v.domain or d like '%.' || v.domain)
         then d end
  from (select lower(split_part(coalesce(p_email, ''), '@', 2)) as d) x
$$;

-- Returns the verified college domain of the current user, or null if they are not trusted right now.
create or replace function public.trusted_submitter_domain() returns text language sql stable security definer set search_path = public, auth as $$
  select public.college_domain_of(u.email)
  from auth.users u join profiles p on p.id = u.id
  where u.id = auth.uid() and u.email_confirmed_at is not null and not p.is_suspended
    and exists (select 1 from jsonb_array_elements(coalesce(auth.jwt()->'amr', '[]'::jsonb)) a
                where a->>'method' in ('otp','magiclink','email/signup'))
$$;

-- ---------- AUTO-APPROVE ON INSERT ----------
-- Runs before RLS checks the row, so the browser cannot choose the status itself.
create or replace function events_insert_guard() returns trigger language plpgsql security definer set search_path = public as $$
declare dom text;
begin
  if auth.uid() is null then return new; end if; -- SQL editor / seeds
  dom := public.trusted_submitter_domain();
  new.is_demo := false; new.is_featured := false; new.reviewed_by := null;
  if dom is not null then
    new.status := 'approved'; new.verified_via := 'college_email'; new.verified_domain := dom;
    new.reviewed_at := now(); new.review_note := 'Auto-published: organizer verified @' || dom;
  else
    new.status := 'pending'; new.verified_via := null; new.verified_domain := null;
    new.reviewed_at := null; new.review_note := null;
  end if;
  return new;
end $$;
drop trigger if exists events_insert_guard_trg on events;
create trigger events_insert_guard_trg before insert on events for each row execute function events_insert_guard();

-- Staff approvals are labelled as such; owners cannot touch the new trust columns.
create or replace function events_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or current_setting('app.review_rpc', true) = 'on' then
    if new.status = 'approved' and old.status <> 'approved' and new.verified_via is null then new.verified_via := 'staff'; end if;
    return new;
  end if;
  new.is_demo := old.is_demo; new.is_featured := old.is_featured; new.submitted_by := old.submitted_by;
  new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at; new.review_note := old.review_note;
  new.verified_via := old.verified_via; new.verified_domain := old.verified_domain;
  new.status := case when old.status = 'needs_correction' then 'pending'::event_status else old.status end;
  return new;
end $$;

drop policy if exists "events: students submit as pending" on events;
create policy "events: submit (auto-approved when college email verified)" on events for insert to authenticated
  with check (submitted_by = auth.uid() and status in ('pending','approved') and not is_demo and not is_featured
              and reviewed_by is null and public.is_active_user());

-- Notification text depends on whether the event went live or is waiting for staff.
create or replace function notify_submission() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.submitted_by is not null then
    if new.status = 'approved' then
      insert into notifications (user_id, type, title, body, event_id)
      values (new.submitted_by, 'event_approved', 'Your event is live', '"' || new.title || '" was verified via your college email and published.', new.id);
    else
      insert into notifications (user_id, type, title, body, event_id)
      values (new.submitted_by, 'submission_received', 'Submission received', '"' || new.title || '" is waiting for staff review.', new.id);
    end if;
  end if;
  return new;
end $$;

-- Bigger flyers (5 MB) are allowed now.
update storage.buckets set file_size_limit = 5242880 where id = 'posters';
