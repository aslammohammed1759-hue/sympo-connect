# SympoConnect — Problem and Solution Report

**Review date:** 24 October 2026  
**Repository reviewed:** `aslammohammed1759-hue/sympo-connect`  
**Deployment URL supplied by the project owner:** https://incandescent-chebakia-cf8e3d.netlify.app/

## Scope and evidence

This is a repository code/configuration review. The source files were inspected and a fix branch was created. This report does **not** claim that the live site, Supabase database, authentication emails, permissions, or Netlify deployment have passed end-to-end testing. Those checks require the owner’s configured Supabase project and a real browser/session.

## Problems found and changes made on this branch

| Priority | Problem | Solution / status |
|---|---|---|
| High | Privacy Policy and Terms pages were explicitly marked as templates/placeholders. | Replaced with a more complete starter notice and terms tailored to the current features. These still require owner/legal review before public launch. |
| Medium | About and Contact were available only in the footer, so visitors could miss them. | Added About and Contact links to the main navigation. |
| Medium | Contact page depended on `VITE_CONTACT_EMAIL` and displayed setup instructions if it was absent. | Kept a clear fallback; the owner must configure a monitored contact email in local and Netlify environment settings. |
| Medium | Project README says reminders do not run automatically until a database schedule is configured. | Documented as a deployment prerequisite; not represented as fixed by code changes. |
| High | The README states the project had not previously been run in its original generation environment. | Added a CI build workflow so GitHub can run an automated production build on pushes and pull requests. Its result must be checked after the branch is pushed. |

## Automated checks added

A GitHub Actions workflow runs `npm ci --include=dev` and `npm run build` on pushes and pull requests. A passing build confirms compilation/bundling only; it does not prove that Supabase configuration, database policies, email verification, uploads, staff review, admin actions, or external links work end to end.

## Manual test plan — required before public sharing

1. **Environment configuration:** Confirm `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_CONTACT_EMAIL` are configured in Netlify; redeploy after changes. Use only the publishable/anon key in browser variables. Never expose a Supabase service-role/secret key.
2. **Supabase setup:** Confirm `supabase/schema.sql` has been applied to the intended project, the `posters` storage bucket exists with the intended restrictions, and Row Level Security is enabled and policies are present.
3. **Authentication:** Register a test account, receive and click the verification email, log in, log out, and verify that password/invalid-login errors are understandable. Confirm the live domain and redirect URLs are configured in Supabase Auth.
4. **Public discovery:** Open the home page and Discover page while logged out. Test search filters, sorting, pagination, event details, mobile navigation, About, Contact, Privacy and Terms.
5. **Submission:** As a test student, submit a fictional test event and poster. Confirm it starts as pending, validation rejects invalid dates/URLs/file types, and the event is not publicly listed before approval.
6. **Staff review:** Using a separate staff account, approve a test submission and verify it appears publicly with the correct badge. Also test correction and rejection paths. Confirm reviewers cannot approve their own submissions.
7. **User features:** Test save/unsave, sharing, reporting, profile updates and notifications. Check that one user cannot read or modify another user’s private data.
8. **Admin and security:** Verify only admins can change roles, suspend users, remove events and view administrative reports/logs. Attempt unauthorized actions with a normal account and confirm the database rejects them.
9. **Storage and links:** Upload an allowed image and confirm oversize/unsupported files are rejected. Check poster visibility and the registration-link warning; a warning is not a guarantee that an external site is safe.
10. **Reminders:** If reminders are advertised as active, enable and verify the documented scheduler and test it. Otherwise describe reminders as not yet active.
11. **Cross-device check:** Open the deployed URL in a private/incognito window and on a second phone/computer. Test direct navigation and refreshing routes such as `/events`, `/auth`, and `/p/privacy`.
12. **Final release:** Review CI results, fix all failures, merge the pull request only after review, wait for Netlify to deploy the merged commit, and repeat smoke tests against the live domain.

## Known limitations / owner actions

- The starter Privacy Policy and Terms are not a substitute for legal review and must be checked against actual data flows, applicable law, retention/deletion arrangements, and the intended audience.
- A working contact email is still required; use an inbox the project owner monitors.
- Database setup, Auth redirect configuration, storage restrictions, administrator creation, and scheduled reminders are project-environment tasks, not proven by frontend source review.
- Do not use real student data or real payment details in testing. Use fictional event data and test accounts.
- Do not publish a “fully tested” claim until the checklist above has been run and recorded.

## Release status

**Status: Fix branch prepared; live release not yet verified.**  
The proposed changes are on branch `fix/navigation-static-pages`. Review and merge the pull request, then verify the automated build and live manual tests before announcing the website publicly.
