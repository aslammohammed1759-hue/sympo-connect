---
applyTo: "backend/**/*.py"
---

# Flask backend instructions

- Inspect the existing backend before editing: do not assume an app factory, entry point, ORM, or test framework.
- Keep Flask configuration environment-driven; never read frontend `VITE_*` variables as backend secrets.
- Validate request data at route boundaries and enforce authentication/authorization server-side.
- Use parameterized database operations; do not interpolate untrusted values into SQL.
- Return stable JSON error responses without stack traces, credentials, or internal infrastructure details.
- Handle exceptions explicitly and log only the context needed to troubleshoot, excluding tokens and sensitive personal data.
- Do not add or modify dependencies without an explicit need and an appropriate backend dependency manifest.
- Run the existing backend tests when present. If there are no tests or dependencies, report that rather than implying they passed.
