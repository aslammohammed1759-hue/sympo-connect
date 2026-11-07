# SympoConnect — Complete Starter Project

A responsive college symposium event portal built with React, Vite, and Supabase, configured for Netlify deployment.

## Included
- Responsive landing page and event cards
- Search and category filters
- Registration modal and client-side validation
- Supabase event loading and registration inserts
- Event assistant UI backed by a server-side Netlify function
- Demo mode when Supabase environment variables are not configured
- Supabase schema with Row Level Security policies
- Netlify SPA redirect and build configuration

## 1. Requirements
- Node.js 18+ (Node 20 LTS recommended)
- A Supabase project
- A Netlify account for deployment

## 2. Run locally
```bash
npm install
cp .env.example .env.local
```
Open `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the values from your Supabase project. Then:
```bash
npm run dev
```
Open the local URL printed by Vite.

On Windows PowerShell, copy the env file with:
```powershell
Copy-Item .env.example .env.local
```

## 3. Set up Supabase
1. Open https://supabase.com/dashboard and select the intended project.
2. Open SQL Editor.
3. Open `supabase/schema.sql` from this project and paste it into a new SQL query.
4. Run the SQL.
5. In Project Settings / API keys, copy the Project URL and the public publishable key or legacy anon key.
6. Use the exact variable names expected by this project: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

The public browser key is not a secret. Security depends on RLS. Never put a `service_role` key or secret key in frontend code or any `VITE_` variable.

## 4. Deploy to Netlify
1. Push this repository to GitHub, or import the repository into Netlify. The root `netlify.toml` sets `SympoConnect_Complete_Project` as the Netlify base directory.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. In Netlify: Project configuration → Environment variables, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your public publishable/anon key
5. Ensure variables apply to production builds.
6. Trigger a new deploy.

To enable the AI event guide, add these server-side Netlify environment variables:
- `AI_API_URL` = full HTTPS URL for an OpenAI-compatible chat-completions endpoint
- `AI_API_KEY` = provider API key (server-side only; never use a `VITE_` prefix)
- `AI_MODEL` = model identifier accepted by that endpoint

The function applies request-size, question-length, timeout, and best-effort per-instance rate limits. Configure provider-side quotas before enabling it publicly. For local function testing, use Netlify CLI (`netlify dev`) so `/.netlify/functions/assistant` is available; `vite dev` alone does not run Netlify functions.

The repository-root `netlify.toml` configures the app base directory, functions, build, and SPA fallback. The app-folder `netlify.toml` supports deployments where `SympoConnect_Complete_Project` itself is selected as the Netlify base. If the site itself returns `401` before the app appears, inspect Netlify Visitor access / Project visibility. A frontend code change cannot override platform-level access protection.

## 5. Supabase Auth note
This starter uses registration inserts, not Supabase Auth login. If you later add authentication, configure the Auth Site URL and allowed redirect URLs for the production domain.

## 6. Common problems
- `401` on the whole homepage: check Netlify site access protection first.
- `401` on a Supabase request: verify the public key and project URL belong together.
- `404` after refreshing a route: ensure `netlify.toml` is deployed.
- Events not loading: run `supabase/schema.sql` and check RLS policies.
- Registration insert rejected: inspect the Supabase error in the browser console and confirm the schema and insert policy exist.

## Project structure
```text
SympoConnect_Complete_Project/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── .env.example
├── README.md
├── netlify/
│   └── functions/
│       └── assistant.mjs
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── supabase.js
│   └── styles.css
└── supabase/
    └── schema.sql
```
