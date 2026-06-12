# Runtime Runbook — Level Up Deen

## Purpose

This is the canonical runtime workflow document for production auth, environment variables, deploy verification, and PWA cache state.

## Server-Side Auth

Current production auth uses `src/middleware.ts` only for Clerk session synchronization.

Reason:

- Clerk needs middleware to complete hosted sign-in handshakes and keep server-readable session cookies current.
- Protected app pages and APIs are guarded inside Server Components and route handlers.
- `src/middleware.ts` must stay Edge-safe: no Supabase calls, no `auth.protect()`, and no custom route enforcement.
- `src/lib/auth.ts` reads Clerk request auth first, then falls back to verifying Clerk `__session` cookies with `verifyToken` and `CLERK_SECRET_KEY`.
- Role checks use Clerk public metadata, especially `admin_system`.

Rules:

- Keep protected pages under `src/app/(app)` guarded by `src/app/(app)/layout.tsx`.
- Keep `/onboarding` outside `(app)` to avoid incomplete-profile redirect loops.
- API routes must call `getCurrentUserId()` or `requireAdminContext()` before database access.
- Every Supabase query for user-owned data must filter by Clerk user ID.
- Do not add route protection to `middleware.ts` without a fresh Edge compatibility test.

## Required Production Environment Variables

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | public | Clerk browser key |
| `CLERK_SECRET_KEY` | server | required for server-side session verification |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | server-side persistence/admin operations |
| `GEMINI_API_KEY` | server optional | AI coach/finance parser; fallback works without it |

Never paste server secrets into chat or documentation.

## Login And Onboarding Flow

1. Public user opens `/`.
2. Existing user signs in via `/login` or Clerk catch-all `/sign-in`.
3. New user registers via `/register` or Clerk catch-all `/sign-up`.
4. Server layout loads profile with `getCurrentUserProfile()`.
5. Missing profile is created idempotently in `users_profile`.
6. Incomplete profile redirects to `/onboarding`.
7. Onboarding stores preferences, upserts user stats, and seeds initial tasks.
8. Completed users land on `/dashboard`.

## Deployment Verification

Run locally:

```bash
npm run verify:workflow
npm run typecheck
npm run build
```

After Vercel production deploy:

```bash
curl -I https://level-up-deen.vercel.app/
curl -I https://level-up-deen.vercel.app/login
curl https://level-up-deen.vercel.app/api/health
curl -I https://level-up-deen.vercel.app/dashboard
curl -I https://level-up-deen.vercel.app/api/tasks
npx vercel logs https://level-up-deen.vercel.app --since 10m
```

Expected logged-out results:

- `/` returns `200`.
- `/login` returns `200`.
- `/api/health` returns `200`.
- `/dashboard` returns `307` to `/login`.
- `/api/tasks` returns `401`.
- Vercel logs show no server errors.

## PWA Cache State

PWA caching is disabled for now.

- `next.config.mjs` sets `next-pwa` `disable: true`.
- `public/sw.js` clears caches and unregisters itself.
- `src/components/pwa/register-sw.tsx` unregisters existing registrations and clears cache storage.

Do not re-enable Workbox caching until the auth/onboarding flow is tested against stale browser profiles after deployment.

## Known Operational Risks

| Risk | Mitigation |
| --- | --- |
| Missing Vercel env vars | Run `vercel env ls` and redeploy after changes |
| Stale service worker | Cleanup worker is deployed; ask user to hard refresh if an old tab remains |
| Brand-new profile race | Profile creation uses deterministic username and Supabase `upsert` on `id` |
| Admin role drift | Treat Clerk public metadata as canonical role source |
| Service-role overreach | Keep strict `user_id` filters in all app/API data paths |
