# AGENTS.md

SympoConnect is a React 18 + Vite single-page app (React Router v6) backed by Supabase (Postgres, Auth, Storage, RLS). It was uploaded as a complete project and deployed as-is to Netlify.

- `src/pages/` – route screens (Home, Events, EventDetail, Auth, Dashboard, Submit, Staff, Admin, Static)
- `src/components/` – shared UI (Navbar, Footer, EventCard, Filters, SafeLink, ProtectedRoute)
- `src/lib/` – constants, URL validation, event queries
- `src/supabaseClient.js` – Supabase client; reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` at build time. When they are missing the app renders a "setup needed" screen instead of crashing.
- `supabase/schema.sql` – the full DB schema, RLS and storage bucket; it runs in the Supabase SQL editor, not via Netlify.

Deployment: `netlify.toml` installs deps with `npm ci --include=dev` (vite is a devDependency) then runs `npm run build`, and publishes `dist`; `public/_redirects` provides the SPA fallback. `vercel.json` is left over from the original project and Netlify ignores it.
Conventions: plain JSX (no TypeScript), plain CSS in `src/styles.css`. Never put the Supabase service_role key in this project.
