---
applyTo: "supabase/**/*.sql,src/supabaseClient.js"
---

# Supabase instructions

- Treat `supabase/schema.sql` and `supabase/migrations/` as database source of truth; do not apply schema changes from Netlify builds.
- Enforce authorization with RLS, database constraints, triggers, and carefully scoped functions—not only with frontend route guards.
- Preserve the client setup fallback for missing or invalid public configuration.
- Keep the anon key public only under RLS protection. Never add the service-role key to source, frontend variables, logs, or CI.
- Make database changes migration-safe and document whether they must be run manually in Supabase.
- For storage changes, preserve and verify bucket access, content-type, and size constraints.
