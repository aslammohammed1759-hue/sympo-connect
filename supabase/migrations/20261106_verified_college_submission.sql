-- Verified college email + manually managed trusted-domain metadata.
-- Apply this migration once in Supabase Dashboard > SQL Editor.
-- This does NOT auto-approve events. All new events remain pending staff review.

create table if not exists public.trusted_college_domains (
  domain text primary key check (domain = lower(domain) and domain !~ '[@/[:space:]]' and position('.' in domain) > 1),
  college_name text not null check (char_length(college_name) between 2 and 150),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.events
  add column if not exists submitter_email_verified boolean not null default false,
  add column if not exists submitter_email_domain text,
  add column if not exists trusted_college_domain boolean not null default false;

create index if not exists events_trusted_domain_idx
  on public.events (trusted_college_domain) where trusted_college_domain = true;

alter table public.trusted_college_domains enable row level security;

create policy "trusted domains: public read active"
  on public.trusted_college_domains for select
  using (is_active = true or public.is_admin());

create policy "trusted domains: admin insert"
  on public.trusted_college_domains for insert to authenticated
  with check (public.is_admin());

create policy "trusted domains: admin update"
  on public.trusted_college_domains for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "trusted domains: admin delete"
  on public.trusted_college_domains for delete to authenticated
  using (public.is_admin());

grant select on public.trusted_college_domains to anon, authenticated;
grant insert, update, delete on public.trusted_college_domains to authenticated;

create or replace function public.stamp_submitter_email_verification()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_domain text;
  v_confirmed_at timestamptz;
begin
  if auth.uid() is null or new.submitted_by is distinct from auth.uid() then
    raise exception 'You must submit an event while signed in.';
  end if;

  select email, email_confirmed_at
    into v_email, v_confirmed_at
    from auth.users
    where id = auth.uid();

  if v_email is null or v_confirmed_at is null then
    raise exception 'Please verify your email address before submitting an event.';
  end if;

  v_domain := lower(split_part(v_email, '@', 2));
  if v_domain = '' or position('.' in v_domain) = 0 then
    raise exception 'A valid verified email address is required.';
  end if;

  new.submitter_email_verified := true;
  new.submitter_email_domain := v_domain;
  new.trusted_college_domain := exists (
    select 1 from public.trusted_college_domains d
    where d.domain = v_domain and d.is_active = true
  );

  return new;
end;
$$;

drop trigger if exists events_stamp_submitter_verification on public.events;
create trigger events_stamp_submitter_verification
  before insert on public.events
  for each row execute function public.stamp_submitter_email_verification();

comment on column public.events.trusted_college_domain is
  'True only when the verified submitter email domain matches an active admin-managed allowlist entry. This is not staff event approval.';
