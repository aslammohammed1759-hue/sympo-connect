---
name: flask-backend
description: Use when inspecting, creating, or changing the Python Flask API in backend/.
---

# Flask backend workflow

1. Inspect `backend/` first and identify the actual application entry point, configuration pattern, dependencies, and tests. Do not infer these from the folder name.
2. The current repository snapshot has a local `backend/venv/`, but no tracked Flask source or dependency/test manifest was found. Treat this as an unconfigured backend until source files are present.
3. Avoid editing or committing virtual-environment files. Keep Python dependencies in a reviewed, project-level manifest if the project adopts them.
4. Keep secrets in backend environment variables; never expose them through frontend `VITE_*` variables.
5. Validate input, authenticate and authorize sensitive operations server-side, parameterize database access, and return scrubbed errors.
6. Add focused route/data-access tests once an existing test runner and app structure are established; do not guess a test command.
7. Report any missing app configuration or dependencies explicitly instead of claiming backend validation succeeded.
