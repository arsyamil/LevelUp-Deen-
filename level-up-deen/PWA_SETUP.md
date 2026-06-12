# PWA Setup Current State

Level Up Deen keeps its web app manifest and offline fallback assets, but production service-worker caching is currently disabled.

## Why Caching Is Disabled

During the June 2026 Vercel/Clerk stabilization work, a Workbox service worker served stale app chunks and stale error UI after production deploys. To keep auth and onboarding reliable, `next-pwa` generation is disabled in `next.config.mjs`.

## Current Behavior

- `src/app/manifest.ts` still provides app metadata and icons.
- `public/offline.html` remains as the offline fallback asset.
- `public/sw.js` is a cleanup worker that clears old caches, claims clients, and unregisters itself.
- `src/components/pwa/register-sw.tsx` unregisters existing service workers and clears browser caches once per session.
- Runtime data writes require network access. Offline queue work remains future/backlog scope.

## Files

| File | Purpose |
| --- | --- |
| `next.config.mjs` | `next-pwa` is installed but disabled with `disable: true` |
| `src/components/pwa/register-sw.tsx` | cleanup of old service workers/caches |
| `public/sw.js` | cleanup service worker |
| `src/app/manifest.ts` | install metadata |
| `public/offline.html` | retained fallback page |

## Re-Enabling PWA Caching

Only re-enable service-worker caching after the auth and deployment flow has browser regression coverage.

Required checklist:

- Verify Clerk sign-in, sign-up, dashboard, onboarding, and sign-out after deploy.
- Exclude authenticated RSC/data responses from long-lived caches.
- Keep `/api/*` network-first or no-store.
- Confirm a new deployment replaces app chunks without manual cache clearing.
- Run `npm run check`.
- Test in a fresh browser profile and a profile with an existing service worker.

## Manual Browser Cleanup

If an old deployment is still visible in a browser:

1. Open DevTools.
2. Go to Application.
3. Unregister service workers for `level-up-deen.vercel.app`.
4. Clear site data.
5. Hard refresh.
