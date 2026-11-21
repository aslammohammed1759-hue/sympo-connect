# GitHub Copilot instructions

Follow [AGENTS.md](../AGENTS.md) for repository-specific architecture and conventions.
Use the relevant [repository skills](skills/) for focused frontend, Flask, or Supabase work. Path-specific instructions in `instructions/` apply to matching files.

## Workflow

- Research existing code and patterns before implementing.
- Outline phases and dependencies for multi-file or multi-layer work.
- Make precise, complete changes without unrelated cleanup.
- Preserve existing React/Vite, Supabase, Netlify, and Flask behavior.
- Review the final diff and run the smallest relevant validation.

## React and Vite

- Use existing plain JSX and CSS conventions.
- Keep route screens in `src/pages/`, shared UI in `src/components/`, and helpers in `src/lib/`.
- Preserve React Router v6 route structure and protected-route role checks.
- Preserve the missing/invalid Supabase configuration fallback.
- Never expose privileged environment values or the Supabase service-role key in browser code.

## Supabase

- Keep auth and authorization enforcement in RLS, trigger guards, security-definer functions, or the Flask backend.
- Do not move Supabase schema changes into Netlify build logic.
- Update SQL schema/migration files only when the task explicitly requires a database change.

## Flask

- Validate configuration and request input at boundaries.
- Enforce authentication and authorization server-side.
- Parameterize database writes and reads.
- Return scrubbed client errors and log detailed server context.

## Quality and security

- Handle errors explicitly; never silently swallow failures.
- Use immutable updates in JavaScript state and data where practical.
- Keep functions and files focused and avoid unnecessary nesting.
- Never add API keys, passwords, private tokens, or service-role credentials to source files.
- Check external links, URL validation, role checks, file uploads, and unauthenticated endpoints when relevant.

## Testing

- Add tests only for behavior that is introduced or fixed.
- Use the existing or proposed test framework for the affected subsystem.
- For frontend changes, at minimum run `npm run build`.
- The current `backend/` directory has no tracked Flask source or dependency/test manifest. Inspect its actual contents before assuming the application entry point or adding tooling.
- Do not claim coverage or test success that was not actually run.

## Commits

Use conventional commit prefixes such as `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, or `ci:`.
