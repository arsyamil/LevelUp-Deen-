# Level Up Deen AI Agent Guide

## Purpose
This file describes how an AI assistant should understand and work with the Level Up Deen app.
It is intended to help the AI quickly reason about project structure, key features, and expected behavior.

## App Summary
Level Up Deen is a progressive self-improvement platform built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.
It includes a modular app shell, user onboarding, gamified daily habits, finance planning, and an AI coach component.
The app also supports progressive web app (PWA) features and admin role-based access control.

## Key Concepts
- `Supabase Auth` is used for authentication (email/password sign-up and login).
- `Supabase` is used for database access, persistence, and session management via `@supabase/ssr`.
- `App Router` is used via `src/app/(app)` for authenticated pages.
- `PWA` manifest support remains, but production service-worker caching is currently disabled; `public/sw.js` is a cleanup worker.
- `RBAC` is implemented with the `role` column in `users_profile` and guarded frontend/backend routes.
- Admin functionality is restricted to the `admin_system` role.
- Supabase is the canonical auth, authorization, and identity source.

## Important Files
- `src/lib/routes.ts` - canonical route paths for auth and app workflow.
- `src/lib/auth.ts` - server-side Supabase session verification and RBAC helpers.
- `src/app/(app)/layout.tsx` - application shell and auth guard for logged-in users.
- `src/app/onboarding/page.tsx` - onboarding route outside authenticated app shell to avoid redirect loops.
- `src/app/(app)/admin/page.tsx` - admin console for role and system management.
- `src/app/(app)/access-control/page.tsx` - role and permission overview.
- `src/components/admin/user-role-management.tsx` - admin UI for role updates.
- `src/app/api/admin/users/route.ts` - admin API route for listing users and updating roles.
- `src/lib/supabase/server.ts` - server-side Supabase helpers and admin client.
- `src/lib/supabase/client.ts` - browser-side Supabase client for auth operations.
- `src/lib/rbac.ts` - role definitions, permission matrix, and UI helpers.
- `src/proxy.ts` - Supabase session refresh and route protection proxy.
- `supabase/migrations/202605010001_init_level_up_deen.sql` - initial database schema.
- `supabase/migrations/202606030001_add_admin_role_change_logs.sql` - admin audit log schema.
- `supabase/migrations/202606190001_add_role_and_email_to_profile.sql` - role and email columns on users_profile.

## Agent Behavior
When making changes, follow these guidelines:
- Preserve existing auth and security logic — Supabase Auth is the sole identity provider.
- Keep admin and user separation strict: normal users must not access other users' data.
- Prefer server-side guards in Next.js components and API routes.
- Proxy handles Supabase session refresh and unauthenticated route redirects.
- Maintain compile safety: always run `npm run build` after changes when possible.
- Keep UI and content consistent with Indonesian language and the existing style.
- Use `src/lib/routes.ts` instead of repeating route strings for core workflow paths.

## Recommended Workflows
1. Read relevant files before editing.
2. Make small, incremental changes with clear purpose.
3. Validate with lint, type checking, and build.
4. Add migrations or schema changes only when necessary.

## Notes for Future Work
- Add Supabase row-level security policies or equivalent server-side ownership guarantees for user ownership boundaries.
- Expand AI coach pages with real data integration and prompt guardrails.
- Add tests and validation for auth flows and role permissions.
- Continue improving the admin workflow and audit history.
- Consider adding social OAuth (Google) via Supabase Auth for easier onboarding.
