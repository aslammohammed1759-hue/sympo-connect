# AGENTS.md

## Project overview

SympoConnect is a React 18 + Vite single-page app (React Router v6) backed by Supabase (Postgres, Auth, Storage, RLS). It also contains a Python Flask backend in `backend/`.

- `src/pages/` – route screens (Home, Events, EventDetail, Auth, Dashboard, Submit, Staff, Admin, Static)
- `src/components/` – shared UI (Navbar, Footer, EventCard, Filters, SafeLink, ProtectedRoute)
- `src/lib/` – constants, URL validation, and event queries
- `src/supabaseClient.js` – Supabase client built from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- `supabase/schema.sql` – full database schema, RLS, and storage bucket
- `supabase/migrations/` – ordered schema migrations
- `backend/` – Python/Flask application code

Deployment: `netlify.toml` installs dependencies with `npm ci --include=dev`, runs `npm run build`, and publishes `dist`. `public/_redirects` provides the SPA fallback. `vercel.json` is legacy configuration and Netlify ignores it.

## Engineering workflow

1. Research existing implementations and repository conventions before changing code.
2. For work spanning multiple files or behavior changes, make a short plan and identify dependencies first.
3. Preserve existing behavior and avoid unrelated edits.
4. Implement the smallest complete change, then run the smallest relevant validation.
5. Review the final diff for regressions, security issues, and accidental secret exposure.
6. Use clear conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, or `ci:`.

## Frontend conventions

- Use plain JSX and plain CSS in `src/styles.css`; do not introduce TypeScript or a CSS framework without an explicit decision.
- Keep route screens in `src/pages/`, reusable UI in `src/components/`, and shared domain helpers in `src/lib/`.
- Follow existing React 18 and React Router v6 patterns.
- Preserve the setup-needed fallback in `src/supabaseClient.js` when Supabase variables are missing or invalid.
- Keep `VITE_*` variables browser-visible. Never place privileged credentials in frontend code.
- Reuse `src/lib/url.js` and existing URL validation behavior for external links.
- Use protected routes for authenticated or role-restricted screens.

## Supabase and database conventions

- Treat `supabase/schema.sql` and migration files as source-controlled database changes.
- Apply schema changes in Supabase using the SQL editor or migrations; Netlify does not run them.
- RLS, role checks, trigger guards, and security-definer functions are authoritative.
- Do not implement security only in the React UI.
- Never commit or expose the Supabase `service_role` key.
- The browser may use the anon key only with RLS and auth enforcement.
- Storage rules must validate file type and size on both the browser and server/storage policy where applicable.

## Flask/backend conventions

- Keep Flask configuration environment-driven and validate required variables at startup.
- Do not import frontend `VITE_*` variables in the backend.
- Validate request input at route boundaries.
- Parameterize database queries and never interpolate untrusted values into SQL.
- Authentication and authorization must be enforced server-side for sensitive operations.
- Return consistent JSON success/error responses and scrub internal details from client-facing errors.
- Keep secrets in environment variables or a secret manager, never in source or committed configuration.
- Add focused tests for route behavior and data access changes.

## Error handling and security

- Handle errors explicitly; do not silently swallow exceptions.
- Surface concise, actionable messages in the UI.
- Log detailed context server-side without passwords, tokens, cookies, or personal data.
- Validate external input, API responses, URLs, and environment values.
- Before any commit, check that no API keys, tokens, passwords, or service-role credentials were added.
- Never weaken RLS, auth checks, role restrictions, or storage policies to make development easier.

## Testing

- Add tests for behavior this change introduces or fixes.
- Prefer focused tests over broad coverage or tests that only restate implementation details.
- For frontend changes, at minimum run `npm run build`. Add browser/E2E coverage for critical flows when tooling exists.
- For Flask changes, run the relevant pytest command once test tooling is present.
- Review edge cases, failed inputs, unauthorized access, and missing configuration.

## Protected files and sensitive surfaces

Do not change these without a specific task:

- Existing React routes and shared page behavior
- Supabase auth and RLS setup
- `supabase/schema.sql` and existing migrations
- `netlify.toml` and `public/_redirects`
- Existing environment variable names

Ask for confirmation before adding dependencies, replacing configuration, or introducing a new framework or test runner.
