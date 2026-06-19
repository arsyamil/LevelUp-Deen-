# Workflow - Level Up Deen

## Current Runtime Workflow

The app uses Supabase Auth for authentication and Supabase PostgreSQL for persistence.

1. Public user lands on `/`.
2. User can open `/login` or `/register`.
3. Existing users sign in from `/login` and continue to `/dashboard`.
4. New users sign up from `/register` and continue to `/onboarding`.
5. Onboarding stores profile preferences, marks `onboarding_completed = true`, and creates recommended daily tasks.
6. Authenticated app pages live under `src/app/(app)`.
7. Admin pages and admin APIs require the `admin_system` role from `users_profile.role`.

Canonical runtime details live in `docs/Runtime_Runbook.md`.

## Auth Guard Workflow

`src/proxy.ts` refreshes Supabase Auth sessions and redirects unauthenticated page requests away from protected app routes.

Protected pages and API routes still use server-side guards:

- `src/lib/auth.ts` reads the current Supabase Auth user.
- `src/app/(app)/layout.tsx` redirects unauthenticated users to `/login`.
- Incomplete profiles redirect to `/onboarding`.
- `/onboarding` lives outside `(app)` so new users can complete onboarding without app-shell redirect loops.
- API routes call `getCurrentUserId()` or `requireAdminContext()` before database access.
- Admin APIs use `requireAdminContext()`.

## Canonical Routes

Core route constants live in `src/lib/routes.ts`.

| Purpose | Route |
| --- | --- |
| Public command center | `/` |
| Login | `/login` |
| Register | `/register` |
| Dashboard | `/dashboard` |
| Onboarding | `/onboarding` |
| Health check | `/api/health` |

## Deployment Workflow

1. Ensure Vercel Production has all required Supabase and Gemini env vars.
2. Run `npm run check`.
3. Deploy with Vercel.
4. Smoke test `/`, `/login`, `/register`, `/api/health`, logged-out `/dashboard`, and logged-out `/api/tasks`.
5. Check recent Vercel logs after deploy.

## Important Gaps To Resolve

- Add automated browser tests for login/register redirects, onboarding completion, task completion idempotency, and admin access.
- Keep strict `user_id` or profile `id` filters in every user-owned query.
- Add or strengthen Supabase RLS policies where server-side ownership guarantees are not enough.
- PWA service-worker caching is disabled until stale-cache regressions are covered by browser tests.
