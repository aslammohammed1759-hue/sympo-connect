---
name: supabase-rls
description: Use when changing Supabase SQL, migrations, auth, storage, or client integration.
---

# Supabase change workflow

1. Inspect the relevant schema, migration history, RLS policies, client call sites, and current auth behavior.
2. Decide whether the change belongs in `supabase/schema.sql`, a new migration, frontend code, or a backend route. Keep the database authoritative for permissions.
3. Preserve existing role protections and avoid relying on UI-only checks for security.
4. Review affected policies, constraints, triggers, functions, and storage policies together; avoid weakening access to make a client operation work.
5. Keep the Supabase anon key in public frontend configuration only. Never use or commit a service-role key in the browser or CI.
6. Document manual SQL-editor steps when required. Do not run migrations as part of the Netlify frontend build.
7. Verify relevant SQL and client behavior where tooling/environment allows; state clearly when a live Supabase project is unavailable.
