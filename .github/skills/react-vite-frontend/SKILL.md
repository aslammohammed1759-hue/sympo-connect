---
name: react-vite-frontend
description: Use when changing SympoConnect React pages, components, routing, styling, or browser behavior.
---

# React/Vite frontend workflow

1. Inspect the target route, shared component, and existing helper before changing behavior.
2. Keep the existing React 18 + Vite + React Router v6 stack, plain JSX, and CSS in `src/styles.css`.
3. Keep route screens in `src/pages/`, shared UI in `src/components/`, and reusable domain logic in `src/lib/`.
4. Preserve the current AuthContext, protected-route role checks, and Supabase setup-needed fallback.
5. Reuse URL validation and existing UI patterns; validate untrusted query parameters and external data.
6. Add a focused test only if the behavior warrants it and a test runner is configured. Do not introduce a new framework without approval.
7. Run `npm run build` and report its result.

Never put privileged credentials in browser code. `VITE_*` values are embedded into the frontend bundle and must be treated as public.
