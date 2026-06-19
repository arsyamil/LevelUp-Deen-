# Document And Workflow Audit — 0d528d9c-ba71-4d84-9197-bfc9263f6ebd

## Scope

Audit requested for local project documents, workflow documentation, and obvious implementation/documentation drift.

Reviewed:

- Root docs: `README.md`, `agents.md`, `design.md`, `PWA_SETUP.md`
- Canonical docs under `docs/`
- Parent PRD: `../PRD_LEVEL_UP_DEEN_v1.0.md`
- Workflow script: `scripts/verify-workflow.js`
- Runtime-critical files under `src/app`, `src/lib`, `src/components/pwa`, `supabase/migrations`

The ID `0d528d9c-ba71-4d84-9197-bfc9263f6ebd` was not found in the local repository, so it is used as this audit record ID.

## Executive Findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | `scripts/verify-workflow.js` required deleted `src/proxy.ts`, so workflow verification was broken. | Fixed |
| High | Docs claimed Clerk proxy route protection, while production route protection belongs in server-side guards. | Fixed in canonical docs |
| High | Docs claimed production PWA caching/offline support, but service-worker caching is disabled for stability. | Fixed in PWA docs/runbook |
| Medium | Duplicate AI coach file `src/app/api/ai/coach/route 2.ts` existed and duplicated an old Supabase-session implementation. | Removed |
| Medium | Root `design.md` overlapped with `docs/design.md`. | Root file converted to canonical pointer |
| Medium | README still said core pages use mock data, but core Supabase flows are now implemented. | Updated |
| Medium | No single runtime runbook existed for auth/env/deploy/PWA state. | Created `docs/Runtime_Runbook.md` |
| Low | AI docs target OpenAI/AI Gateway, while implementation currently uses Gemini direct with fallback. | Recorded as remaining alignment task |

## Duplicate Or Crossed Documents

| Document | Issue | Decision |
| --- | --- | --- |
| `design.md` and `docs/design.md` | Two design references could drift. | Keep `docs/design.md` canonical; root `design.md` now points there. |
| `PWA_SETUP.md`, `docs/Architecture.md`, `docs/Security.md`, `docs/Backlog.md` | PWA state conflicted with current disabled service worker. | Updated to current disabled-cache state. |
| `docs/Security.md` vs runtime | Described proxy route protection instead of sync-only proxy plus server-side guards. | Updated security model. |
| `docs/Workflow.md` vs runtime | Too short; did not explain sync-only proxy, server-side auth guards, and PWA cleanup. | Expanded and linked runbook. |
| `src/app/api/ai/coach/route.ts` and `route 2.ts` | Duplicate endpoint intent; old file used Supabase auth session and could confuse future work. | Deleted `route 2.ts`. |

## Workflow Gaps Closed

- Added `docs/Runtime_Runbook.md`.
- Updated workflow verification to assert current sync-only proxy auth architecture.
- Added verification checks for PWA cleanup state.
- Added verification checks that duplicate AI coach route is absent.
- Documented required Vercel production env vars.
- Documented production smoke test expectations.

## Remaining Documentation Alignment Tasks

| Area | Current Mismatch | Recommended Next Step |
| --- | --- | --- |
| AI provider | Docs describe OpenAI/Anthropic or AI Gateway; code uses Gemini with fallback. | Decide target provider strategy, then align `docs/AI_Spec.md`, `docs/Architecture.md`, and `.env.local.example`. |
| Offline-first scope | PRD and architecture describe offline queue/IndexedDB; implementation has a localStorage helper and PWA caching disabled. | Keep as backlog until service worker regression tests exist. |
| RLS wording | Security docs mention RLS as strategic protection, but app currently relies heavily on server-side service-role guards. | Add a dedicated Supabase RLS implementation checklist before public beta. |
| Observability | Docs mention monitoring/analytics but implementation has minimal logging. | Add telemetry plan and error tracking decision. |
| Test coverage | Docs require tests, but repository mainly has build/type/script checks. | Add Playwright smoke tests for auth/onboarding/dashboard/admin. |

## Commands Run

```bash
rg --files
rg "0d528d9c-ba71-4d84-9197-bfc9263f6ebd|0d528d9c" -n ..
find .. -maxdepth 3 -type f \( -iname '*.md' -o -iname '*.mdx' -o -iname '*.txt' -o -iname '*.docx' -o -iname '*.pdf' \)
find src/app -type f \( -name 'page.tsx' -o -name 'route.ts' -o -name 'layout.tsx' -o -name 'error.tsx' \)
npm run verify:workflow
npm run lint
npm run typecheck
npm run build
npm run check
```

`npm run verify:workflow` initially failed because it expected the wrong proxy state. That was a workflow bug and has been corrected.

## Validation Checklist

- [x] Remove duplicate AI coach route artifact.
- [x] Update workflow verification for sync-only proxy auth.
- [x] Update root docs that contradicted runtime.
- [x] Create missing runtime runbook.
- [x] Keep audit record tied to requested ID.
- [x] Run `npm run check`.
- [ ] Reconcile AI provider strategy across docs and code.
- [ ] Add browser/auth regression tests.
