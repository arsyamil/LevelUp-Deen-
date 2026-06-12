# Workflow — Level Up Deen

## Current Runtime Workflow

The app uses Clerk for authentication/authorization and Supabase for persistence.

1. Public user lands on `/`.
2. User can open `/login` or `/register`.
3. Existing users sign in from `/login` and continue to `/dashboard`.
4. New users sign up from `/register` and continue to `/onboarding`.
5. Onboarding stores profile preferences, marks `onboarding_completed = true`, and creates recommended daily tasks.
6. Authenticated app pages live under `src/app/(app)`.
7. Admin pages require Clerk public metadata role `admin_system`.

Canonical runtime details live in `docs/Runtime_Runbook.md`.

## Auth Guard Workflow

`src/middleware.ts` exists only for Clerk session synchronization and hosted sign-in handshakes.

Protected pages and API routes use server-side guards:

- `src/middleware.ts` must not call `auth.protect()` or query Supabase.
- `src/lib/auth.ts` reads Clerk request auth first, then verifies Clerk `__session` cookies with `verifyToken` and `CLERK_SECRET_KEY` as a fallback.
- `src/app/(app)/layout.tsx` redirects unauthenticated users to `/login`.
- Incomplete profiles redirect to `/onboarding`.
- `/onboarding` lives outside `(app)` so new users can complete onboarding without app-shell redirect loops.
- Admin APIs use `requireAdminContext()`.

## Canonical Routes

Core route constants live in `src/lib/routes.ts`.

| Purpose | Route |
| --- | --- |
| Public command center | `/` |
| Login | `/login` |
| Register | `/register` |
| Clerk sign-in catchall | `/sign-in` |
| Clerk sign-up catchall | `/sign-up` |
| Dashboard | `/dashboard` |
| Onboarding | `/onboarding` |
| Health check | `/api/health` |

## Deployment Workflow

1. Ensure Vercel Production has all required Clerk and Supabase env vars.
2. Run `npm run verify:workflow`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Deploy with `npx vercel --prod --force` when cache-sensitive runtime changes are involved.
6. Smoke test `/`, `/login`, `/api/health`, logged-out `/dashboard`, and logged-out `/api/tasks`.
7. Check `npx vercel logs https://level-up-deen.vercel.app --since 10m`.

## Important Gaps To Resolve

- Supabase user references now use Clerk-compatible `text` IDs.
- Most server routes use the Supabase service role client. Keep strict `user_id` filters and Clerk guards until Supabase JWT/RLS is fully integrated with Clerk.
- Add automated tests for login/register redirects, onboarding completion, task completion idempotency, and admin access.
- PWA service-worker caching is disabled until stale-cache regressions are covered by browser tests.
