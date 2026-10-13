# SympoConnect

College symposium, hackathon, workshop and event finder. React (Vite) + Supabase (Postgres, Auth, Storage, RLS).
Roles: **student** (browse, save, submit, report) → **staff** (review submissions) → **admin** (manage users/roles, moderation, audit log).

> Honest status: the code was written but **not run** in the environment that generated it (no network for `npm install`, no Supabase project). Follow the testing checklist below and fix any small typo or config issue you find.

## Project layout
```
supabase/schema.sql      tables, constraints, indexes, triggers, RPCs, RLS, storage bucket (run once)
supabase/seed_demo.sql   optional: 3 fictional DEMO events
src/lib/                 constants, URL validation (url.js), event query (events.js)
src/components/          Navbar, Footer, EventCard, Filters, SafeLink, ProtectedRoute
src/pages/               Home, Events, EventDetail, Auth, Dashboard, Submit, Staff, Admin, Static
```

## 1. Create the Supabase project
1. Sign up at supabase.com → **New project** → choose a name, a strong database password, a region near you.
2. Wait until it finishes provisioning.

## 2. Create tables, security rules, storage
1. Dashboard → **SQL Editor → New query**.
2. Paste all of `supabase/schema.sql` → **Run**. Run it **once** (running twice errors on existing types/tables).
3. Optional demo data: paste `supabase/seed_demo.sql` → Run. Remove later with `delete from events where is_demo;`.
4. Check **Storage**: a public bucket `posters` (2 MB limit, JPG/PNG/WebP only) should exist.

## 3. Authentication
1. **Authentication → Providers → Email**: enabled, **Confirm email = ON** (this gives email verification).
2. **Authentication → URL Configuration**: set **Site URL** to `http://localhost:5173` for now; add the same under Redirect URLs. After deploying, change it to your live URL (and keep localhost as an extra redirect URL if you still develop locally).
3. Supabase's built-in email sender is rate-limited; for real launches configure custom SMTP under Authentication → SMTP Settings.

## 4. Environment variables
1. Dashboard → **Project Settings → API**. Copy **Project URL** and the **anon public** key.
2. `cp .env.example .env.local` and fill in `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (optional `VITE_CONTACT_EMAIL`).
3. **Never** put the `service_role` key anywhere in this project. The anon key is safe in the browser because RLS protects the data.

## 5. Run locally
```
npm install
npm run dev
```
Open http://localhost:5173.

## 6. Create your first admin
Roles can't be set from the browser (a database trigger blocks it). Do this once:
1. Sign up on the site and verify your email.
2. SQL Editor, run (use your email):
```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```
3. Log out and in. You'll see **Admin** in the menu.
4. To make staff: have a user click **Request staff access** on their dashboard Profile tab, then Admin → Users → set role to `staff`.

## 7. Adding and approving genuine events
1. A signed-in student/organizer opens **Post an event**, fills the form and uploads a poster. Status becomes **PENDING** and they get a "Submission received" notification.
2. Staff opens **Staff**, checks the poster, college, organizer contact and registration link, ticks the checklist and clicks **Approve**, **Request corrections** or **Reject** (reason required for the last two).
3. Approved events appear publicly with a "Staff verified" badge; the reviewer and time are recorded and an audit-log row is written.
4. Nobody can approve their own submission (enforced in the database). Only admins can remove events or change roles.
5. Demo events are always shown as **DEMO DATA** and never get a verified badge.

## 8. Reminders (needs scheduling)
In-app reminders (saved event within 3 days; registration closing within 2 days) are created by the SQL function `send_event_reminders()`. Supabase has no automatic schedule, so:
1. Dashboard → **Database → Extensions** → enable `pg_cron`.
2. SQL Editor:
```sql
select cron.schedule('sympo-reminders', '0 3 * * *', $$select public.send_event_reminders()$$);
```
Until you do this, reminders are simply not generated (nothing fake is shown). Email/push notifications are not included; they would need an Edge Function plus an email provider.

## 9. Deploy the frontend (Netlify or Vercel)
1. Push the project to GitHub.
2. Netlify: **Add new site → Import from Git**, build command `npm run build`, publish directory `dist`. Vercel: import the repo (Vite is auto-detected).
3. Add environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (and `VITE_CONTACT_EMAIL`) in the host's settings, then redeploy.
4. `public/_redirects` (Netlify) and `vercel.json` already make page refreshes work with React Router.
5. Back in Supabase **Authentication → URL Configuration**, set Site URL to your deployed URL and add it to Redirect URLs.

## 10. Test checklist
1. Sign up → get the verification email → log in.
2. Post an event with a poster → shows as Pending in Dashboard → My submissions; not visible on Discover.
3. Log in as staff/admin → Staff → approve it → it appears on Discover with a verified badge.
4. Try approving your own event as admin → it must fail ("You cannot review your own submission").
5. Search by college, district, state, category, date, free/paid, online/offline; check the empty state.
6. Save, share and report an event; confirm the report shows in Admin → Reports.
7. Open the registration link: a warning dialog shows the real domain first.
8. In the browser console, try `supabase.from('profiles').update({role:'admin'})`: it must be rejected.

## Security notes
- Permissions are enforced by RLS policies, guard triggers and `security definer` functions in `schema.sql`, never by the browser's idea of a role.
- Posters: JPG/PNG/WebP, max 2 MB, checked in the browser and enforced by the storage bucket. The bucket is public-read, so a poster URL of a still-pending event works if someone knows the exact random path.
- URLs are normalized in the browser and constrained to http(s) in the database. The warning dialog is a heuristic (shorteners, raw IPs, punycode, http); it can't prove a site is safe.
- The Privacy Policy and Terms pages are placeholders. Replace them before launch.
