-- SympoConnect schema. Run ONCE in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create type user_role as enum ('student','staff','admin');
create type event_status as enum ('pending','approved','rejected','needs_correction','removed');

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- TABLES ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  college_name text not null default '' check (char_length(college_name) <= 150),
  district text not null default '' check (char_length(district) <= 80),
  role user_role not null default 'student',
  staff_requested boolean not null default false,
  is_suspended boolean not null default false,
  notify_prefs jsonb not null default '{"in_app":true,"reminders":true}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table event_categories (
  id serial primary key,
  name text not null unique,
  icon text not null default '🎓'
);
insert into event_categories (name, icon) values
 ('Symposium','🏛️'),('Hackathon','💻'),('Paper Presentation','📄'),('Project Expo','🧪'),
 ('Coding Competition','⌨️'),('Workshop','🛠️'),('Seminar','🎤'),('Cultural','🎭'),('Technical Quiz','❓');

create table events (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references profiles(id) on delete set null,
  title text not null check (char_length(title) between 3 and 150),
  college_name text not null check (char_length(college_name) between 3 and 150),
  district text not null check (char_length(district) between 2 and 80),
  state text not null check (char_length(state) between 2 and 80),
  description text not null check (char_length(description) between 20 and 5000),
  category_id int references event_categories(id),
  event_date date not null,
  registration_deadline date,
  fee numeric(8,2) not null default 0 check (fee >= 0),
  mode text not null default 'offline' check (mode in ('online','offline','hybrid')),
  venue text check (char_length(venue) <= 300),
  contact text not null check (char_length(contact) between 5 and 150),
  registration_url text not null check (registration_url ~* '^https?://[^\s]+$'),
  video_url text check (video_url is null or video_url ~* '^https?://[^\s]+$'),
  poster_path text,
  status event_status not null default 'pending',
  is_demo boolean not null default false,
  is_featured boolean not null default false,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (registration_deadline is null or registration_deadline <= event_date)
);
create index events_status_date_idx on events (status, event_date);
create index events_category_idx on events (category_id);
create index events_state_idx on events (state);
create index events_district_idx on events (lower(district));
create index events_college_idx on events (lower(college_name));
create index events_created_idx on events (created_at desc);
create index events_submitter_idx on events (submitted_by);

-- Review history (one row per staff decision)
create table event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  reviewer_id uuid references profiles(id) on delete set null,
  action text not null check (action in ('approved','rejected','needs_correction','removed')),
  note text,
  created_at timestamptz not null default now()
);
create index event_submissions_event_idx on event_submissions (event_id);

create table saved_events (
  user_id uuid not null references profiles(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason text not null check (reason in ('fake','wrong_info','suspicious_link','duplicate','other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','resolved','dismissed')),
  handled_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, reporter_id)
);
create index event_reports_status_idx on event_reports (status);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('submission_received','event_approved','event_rejected','correction_requested','event_removed','saved_reminder','deadline_reminder')),
  title text not null,
  body text,
  event_id uuid references events(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, is_read, created_at desc);

create table audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on audit_logs (created_at desc);

create trigger profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger events_updated before update on events for each row execute function set_updated_at();

-- ---------- ROLE HELPERS ----------
create function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin' and not is_suspended) $$;
create function public.is_staff() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and role in ('staff','admin') and not is_suspended) $$;
create function public.is_active_user() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and not is_suspended) $$;

create function public.log_audit(p_action text, p_type text, p_target text, p_details jsonb default null)
returns void language sql security definer set search_path = public as
$$ insert into audit_logs (actor_id, action, target_type, target_id, details) values (auth.uid(), p_action, p_type, p_target, p_details) $$;
revoke all on function public.log_audit(text,text,text,jsonb) from public, anon, authenticated;

-- ---------- GUARD TRIGGERS (the real protection against tampering) ----------
create function profiles_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin()
     and (new.role is distinct from old.role or new.is_suspended is distinct from old.is_suspended) then
    raise exception 'Only administrators can change roles or suspend accounts';
  end if;
  return new;
end $$;
create trigger profiles_guard_trg before update on profiles for each row execute function profiles_guard();

create function events_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Free pass only inside review_event()/admin RPCs (they set this flag) or from the SQL editor.
  if auth.uid() is null or current_setting('app.review_rpc', true) = 'on' then return new; end if;
  new.is_demo := old.is_demo; new.is_featured := old.is_featured; new.submitted_by := old.submitted_by;
  new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at; new.review_note := old.review_note;
  new.status := case when old.status = 'needs_correction' then 'pending'::event_status else old.status end;
  return new;
end $$;
create trigger events_guard_trg before update on events for each row execute function events_guard();

-- New auth user -> profile (role is ALWAYS student; browser metadata cannot set it)
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, college_name, district) values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'full_name',''),100),
    left(coalesce(new.raw_user_meta_data->>'college_name',''),150),
    left(coalesce(new.raw_user_meta_data->>'district',''),80));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- "Submission received" notification
create function notify_submission() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.submitted_by is not null then
    insert into notifications (user_id, type, title, body, event_id)
    values (new.submitted_by, 'submission_received', 'Submission received', '"' || new.title || '" is waiting for staff review.', new.id);
  end if;
  return new;
end $$;
create trigger events_notify_trg after insert on events for each row execute function notify_submission();

-- ---------- RPCs ----------
create function public.review_event(p_event_id uuid, p_action text, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare ev events%rowtype; st event_status; ntype text; ntitle text;
begin
  if not public.is_staff() then raise exception 'Not authorized'; end if;
  if p_action = 'remove' and not public.is_admin() then raise exception 'Only administrators can remove events'; end if;
  if p_action in ('reject','needs_correction','remove') and coalesce(trim(p_note),'') = '' then raise exception 'A reason is required'; end if;
  select * into ev from events where id = p_event_id for update;
  if not found then raise exception 'Event not found'; end if;
  if ev.submitted_by = auth.uid() then raise exception 'You cannot review your own submission'; end if;
  if p_action <> 'remove' and ev.status <> 'pending' then raise exception 'Only pending events can be reviewed'; end if;
  if p_action = 'approve' then st := 'approved'; ntype := 'event_approved'; ntitle := 'Event approved';
  elsif p_action = 'reject' then st := 'rejected'; ntype := 'event_rejected'; ntitle := 'Event rejected';
  elsif p_action = 'needs_correction' then st := 'needs_correction'; ntype := 'correction_requested'; ntitle := 'Corrections requested';
  elsif p_action = 'remove' then st := 'removed'; ntype := 'event_removed'; ntitle := 'Event removed';
  else raise exception 'Invalid action'; end if;
  perform set_config('app.review_rpc', 'on', true);
  update events set status = st, reviewed_by = auth.uid(), reviewed_at = now(), review_note = nullif(trim(p_note),'') where id = p_event_id;
  insert into event_submissions (event_id, reviewer_id, action, note) values (p_event_id, auth.uid(), st::text, nullif(trim(p_note),''));
  if ev.submitted_by is not null then
    insert into notifications (user_id, type, title, body, event_id)
    values (ev.submitted_by, ntype, ntitle, '"' || ev.title || '"' || coalesce(': ' || nullif(trim(p_note),''), ''), p_event_id);
  end if;
  perform public.log_audit('event_' || st::text, 'event', p_event_id::text, jsonb_build_object('note', p_note));
end $$;

create function public.admin_set_role(p_user uuid, p_role user_role) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_user = auth.uid() then raise exception 'You cannot change your own role'; end if;
  update profiles set role = p_role, staff_requested = false where id = p_user;
  perform public.log_audit('set_role', 'profile', p_user::text, jsonb_build_object('role', p_role));
end $$;

create function public.admin_set_suspended(p_user uuid, p_suspended boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_user = auth.uid() then raise exception 'You cannot suspend yourself'; end if;
  update profiles set is_suspended = p_suspended where id = p_user;
  perform public.log_audit(case when p_suspended then 'suspend_user' else 'unsuspend_user' end, 'profile', p_user::text);
end $$;

create function public.admin_set_featured(p_event uuid, p_featured boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  perform set_config('app.review_rpc', 'on', true);
  update events set is_featured = p_featured where id = p_event;
  perform public.log_audit(case when p_featured then 'feature_event' else 'unfeature_event' end, 'event', p_event::text);
end $$;

-- Reminders for saved events. Schedule with pg_cron (see README).
create function public.send_event_reminders() returns integer language plpgsql security definer set search_path = public as $$
declare total integer := 0; c integer;
begin
  insert into notifications (user_id, type, title, body, event_id)
  select s.user_id, 'saved_reminder', 'Saved event coming up', e.title || ' is on ' || to_char(e.event_date,'DD Mon YYYY'), e.id
  from saved_events s join events e on e.id = s.event_id join profiles p on p.id = s.user_id
  where e.status = 'approved' and e.event_date between current_date and current_date + 3
    and not p.is_suspended and coalesce(p.notify_prefs->>'reminders','true') <> 'false'
    and not exists (select 1 from notifications nn where nn.user_id = s.user_id and nn.event_id = e.id and nn.type = 'saved_reminder');
  get diagnostics c = row_count; total := total + c;
  insert into notifications (user_id, type, title, body, event_id)
  select s.user_id, 'deadline_reminder', 'Registration closing soon', 'Registration for ' || e.title || ' closes on ' || to_char(e.registration_deadline,'DD Mon YYYY'), e.id
  from saved_events s join events e on e.id = s.event_id join profiles p on p.id = s.user_id
  where e.status = 'approved' and e.registration_deadline between current_date and current_date + 2
    and not p.is_suspended and coalesce(p.notify_prefs->>'reminders','true') <> 'false'
    and not exists (select 1 from notifications nn where nn.user_id = s.user_id and nn.event_id = e.id and nn.type = 'deadline_reminder');
  get diagnostics c = row_count; total := total + c;
  return total;
end $$;
revoke all on function public.send_event_reminders() from public, anon, authenticated;

create view duplicate_events with (security_invoker = true) as
  select lower(title) as title_key, lower(college_name) as college_key, event_date, count(*) as copies, array_agg(id) as event_ids
  from events where status <> 'removed' group by 1,2,3 having count(*) > 1;

-- ---------- ROW LEVEL SECURITY ----------
alter table profiles enable row level security;
alter table event_categories enable row level security;
alter table events enable row level security;
alter table event_submissions enable row level security;
alter table saved_events enable row level security;
alter table event_reports enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

create policy "profiles: read own or staff" on profiles for select using (id = auth.uid() or public.is_staff());
create policy "profiles: update own" on profiles for update using (id = auth.uid() and public.is_active_user()) with check (id = auth.uid());

create policy "categories: public read" on event_categories for select using (true);
create policy "categories: admin write" on event_categories for all using (public.is_admin()) with check (public.is_admin());

create policy "events: public sees approved, owner sees own, staff sees all" on events for select
  using (status = 'approved' or submitted_by = auth.uid() or public.is_staff());
create policy "events: students submit as pending" on events for insert to authenticated
  with check (submitted_by = auth.uid() and status = 'pending' and not is_demo and not is_featured and reviewed_by is null and public.is_active_user());
create policy "events: owner edits while pending/needs correction" on events for update to authenticated
  using (submitted_by = auth.uid() and status in ('pending','needs_correction') and public.is_active_user())
  with check (submitted_by = auth.uid());
create policy "events: admin delete" on events for delete to authenticated using (public.is_admin());

create policy "review log: owner or staff read" on event_submissions for select
  using (public.is_staff() or exists (select 1 from events e where e.id = event_id and e.submitted_by = auth.uid()));

create policy "saved: own rows" on saved_events for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_active_user());

create policy "reports: insert own" on event_reports for insert to authenticated with check (reporter_id = auth.uid() and public.is_active_user());
create policy "reports: read own or staff" on event_reports for select using (reporter_id = auth.uid() or public.is_staff());
create policy "reports: staff update" on event_reports for update using (public.is_staff()) with check (public.is_staff());

create policy "notifications: read own" on notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications: update own" on notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on notifications from authenticated;
grant update (is_read) on notifications to authenticated;

create policy "audit: admin read" on audit_logs for select using (public.is_admin());

-- ---------- POSTER STORAGE ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('posters','posters', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
create policy "posters: upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'posters' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "posters: delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'posters' and (storage.foldername(name))[1] = auth.uid()::text);
