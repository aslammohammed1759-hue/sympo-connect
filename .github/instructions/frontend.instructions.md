---
applyTo: "src/**/*.js,src/**/*.jsx,src/**/*.css"
---

# Frontend instructions

- Preserve the existing React 18, Vite, and React Router v6 architecture.
- Use plain JSX and the existing plain CSS stylesheet; do not introduce TypeScript or a styling framework without approval.
- Keep route screens in `src/pages/`, reusable UI in `src/components/`, and shared helpers in `src/lib/`.
- Preserve authentication and role checks in the existing auth context and protected routes.
- Keep browser configuration limited to intended `VITE_*` variables. Never expose a Supabase service-role key.
- Preserve the setup-needed UI when Supabase configuration is missing or invalid.
- Use existing URL validation helpers for external links and preserve accessible labels and keyboard behavior.
- Run `npm run build` after frontend changes. Add focused tests only when a test runner is already configured or explicitly approved.
