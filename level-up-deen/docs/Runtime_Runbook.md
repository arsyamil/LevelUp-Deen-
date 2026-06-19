# Runtime Runbook - Level Up Deen

## Purpose

This is the canonical runtime workflow document for production auth, environment variables, deploy verification, and PWA cache state.

## Server-Side Auth

Current production auth uses Supabase Auth.

Rules:

- `src/proxy.ts` refreshes Supabase Auth sessions with `@supabase/ssr`.
- Protected pages stay under `src/app/(app)` and are guarded by `src/app/(app)/layout.tsx`.
- Keep `/onboarding` outside `(app)` to avoid incomplete-profile redirect loops.
- API routes must call `getCurrentUserId()` or `requireAdminContext()` before database access.
- Every Supabase query for user-owned data must filter by the authenticated Supabase user id.
- Admin role checks read `users_profile.role` and require `admin_system`.
- `AUTH_BYPASS_ENABLED` is for non-production local development only.

## Required Production Environment Variables

| Variable | Scope | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | public | Canonical app URL |
| `NEXT_PUBLIC_SUPABASE_URL` | public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Server-side persistence/admin operations |
| `GEMINI_API_KEY` | server optional | AI coach/finance parser; fallback works without it |

Never paste server secrets into chat or documentation.

## Login And Onboarding Flow

1. Public user opens `/`.
2. Existing user signs in via `/login`.
3. New user registers via `/register`.
4. Server layout loads profile with `getCurrentUserProfile()`.
5. Missing profile is created idempotently in `users_profile`.
6. Incomplete profile redirects to `/onboarding`.
7. Onboarding stores preferences, upserts user stats, and seeds initial tasks.
8. Completed users land on `/dashboard`.

## Deployment Verification

Run locally:

```bash
npm run check
```

After production deploy:

```bash
curl -I https://level-up-deen.vercel.app/
curl -I https://level-up-deen.vercel.app/login
curl https://level-up-deen.vercel.app/api/health
curl -I https://level-up-deen.vercel.app/dashboard
curl -I https://level-up-deen.vercel.app/api/tasks
```

Expected logged-out results:

- `/` returns `200`.
- `/login` returns `200`.
- `/api/health` returns `200`.
- `/dashboard` redirects to `/login`.
- `/api/tasks` returns `401`.
- Production logs show no server errors.

## PWA Cache State

PWA caching is disabled for now.

- `next.config.mjs` is plain Next.js config with no Workbox/PWA wrapper.
- `public/sw.js` clears caches, claims clients, and unregisters itself.
- `src/components/pwa/register-sw.tsx` unregisters existing registrations and clears cache storage.

Do not re-enable Workbox caching until the auth/onboarding flow is tested against stale browser profiles after deployment.

## Known Operational Risks

| Risk | Mitigation |
| --- | --- |
| Missing Vercel env vars | Verify env vars and redeploy after changes |
| Stale service worker | Cleanup worker is deployed; ask user to hard refresh if an old tab remains |
| Brand-new profile race | Profile creation uses deterministic username and Supabase `upsert` on `id` |
| Admin role drift | Treat `users_profile.role` as the canonical app role |
| Service-role overreach | Keep strict user ownership filters in all app/API data paths |
