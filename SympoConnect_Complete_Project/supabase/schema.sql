-- SympoConnect starter schema
-- Run this in Supabase SQL Editor for the project you intend to use.
-- RLS is enabled. Public visitors may read published events and insert registrations.
-- Never disable RLS or expose a service_role key in the browser.

create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Technical',
  description text not null default '',
  event_date date,
  event_time text,
  venue text not null default 'College Campus',
  team_size text not null default 'Individual',
  fee numeric(10,2) not null default 0 check (fee >= 0),
  status text not null default 'published' check (status in ('draft','published','closed')),
  created_at timestamptz not null default now()
);

alter table public.events
  add column if not exists category text not null default 'Technical';

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_name text not null,
  email text not null,
  phone text,
  college text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.registrations enable row level security;

drop policy if exists "Anyone can view published events" on public.events;
create policy "Anyone can view published events"
on public.events for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Anyone can submit registration" on public.registrations;
create policy "Anyone can submit registration"
on public.registrations for insert
to anon, authenticated
with check (
  char_length(trim(participant_name)) between 2 and 100
  and char_length(trim(email)) between 5 and 254
);

-- Deliberately do not grant public read access to registrations.
-- Add authenticated admin-only policies separately if an admin dashboard is needed.

insert into public.events
(title, category, description, event_date, event_time, venue, team_size, fee, status)
select * from (values
  ('Paper Presentation', 'Technical', 'Present your ideas, research, and innovations to a panel of reviewers.', null::date, '10:00 AM', 'Seminar Hall', 'Individual / Team', 0::numeric, 'published'),
  ('Code Busters', 'Technical', 'Solve programming challenges with logic, speed, and clean code.', null::date, '11:00 AM', 'Computer Lab', 'Individual / Team', 0::numeric, 'published'),
  ('Web Craft', 'Technical', 'Build a polished web experience from a creative prompt.', null::date, '12:00 PM', 'Computer Lab', 'Individual / Team', 0::numeric, 'published'),
  ('MIME MANIA', 'Non-Technical', 'Express a story through gestures, timing, and imagination.', null::date, '01:00 PM', 'Main Auditorium', 'Team', 0::numeric, 'published'),
  ('Clue Quest', 'Non-Technical', 'Follow clues, solve puzzles, and race toward the final answer.', null::date, '02:00 PM', 'Campus', 'Team', 0::numeric, 'published'),
  ('Snap Sense', 'Creative', 'Capture a compelling moment around a surprise theme.', null::date, '02:30 PM', 'Campus', 'Individual', 0::numeric, 'published'),
  ('CONNECT CRAZE', 'Fun', 'Meet your team, think fast, and take on quick interactive rounds.', null::date, '03:00 PM', 'Activity Hall', 'Team', 0::numeric, 'published'),
  ('Human vs AI', 'AI & DS', 'Compare human reasoning with AI-powered answers in a fun challenge.', null::date, '03:30 PM', 'Seminar Hall', 'Individual / Team', 0::numeric, 'published')
) as seed(title, category, description, event_date, event_time, venue, team_size, fee, status)
where not exists (select 1 from public.events);