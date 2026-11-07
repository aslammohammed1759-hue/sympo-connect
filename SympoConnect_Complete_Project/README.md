# SympoConnect — Complete Starter Project

A responsive college symposium event portal built with React and Vite, using Netlify Functions and Netlify Database.

## Included
- Responsive landing page and event cards
- Search and category filters
- Registration modal with client- and server-side validation
- Registrations stored in Netlify Database (managed Postgres) via a Netlify Function at `/api/register`
- Netlify SPA redirect and build configuration

## Run locally
```bash
npm install
netlify dev
```

## Data storage
Registrations are saved to the `registrations` table in Netlify Database. The schema lives in `db/schema.ts`
and migrations in `netlify/database/migrations/`; Netlify applies them automatically on deploy. No database
credentials or environment variables are needed.

To change the schema, edit `db/schema.ts` and run `npx drizzle-kit generate --name <change_name>`.

The event list lives in `src/events.js` and is shared by the site and the registration API.

## Project structure
```text
SympoConnect_Complete_Project/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── drizzle.config.ts
├── db/
│   ├── schema.ts
│   └── index.ts
├── netlify/
│   ├── functions/register.ts
│   └── database/migrations/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── events.js
    └── styles.css
```
