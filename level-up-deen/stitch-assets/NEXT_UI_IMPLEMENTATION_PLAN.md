# Next UI Implementation Plan

Source: Stitch project `13990767071446712286` (`QuestLife PRD`)

## Goal

Translate the extracted Stitch HTML and previews into production Next.js/Tailwind views while preserving the existing app workflow, Clerk/Supabase boundaries, Indonesian copy direction, and route constants.

## Phase 1 - Design System Alignment

1. Extract reusable tokens from `stitch-assets/get-project.parsed.json`.
2. Map Stitch colors to Tailwind theme variables:
   - Quest Purple: `#7c3aed`
   - Level-Up Green: `#10b981`
   - Stamina Orange: `#f59e0b`
   - Slate/support color: `#64748b`
3. Confirm type choices:
   - Display: `Sora`
   - Body/UI: `Geist`
4. Decide which existing components should be updated instead of duplicated.

## Phase 2 - Shared Components

Build or update these shared components first:

1. App HUD/sidebar/bottom navigation.
2. Quest card.
3. Progress/ring meter.
4. XP, streak, difficulty, and status badges.
5. Stat summary card.
6. Empty/loading/error states.
7. Mobile bottom navigation.
8. Page header with quick actions.

## Phase 3 - Screen Translation Order

Implement in this order because each later screen reuses earlier components:

1. `Dashboard` (`e003598045be4bb1b4848fa281a0f486`) as the canonical home dashboard.
2. `Daily Quests` (`e67e543aa9bc4792a008eedf7b6d3c7a`) for habit/task UI.
3. `Deen Tracker` (`8f62baf036cb4d8abce6f1dc53639ce1`) for prayer/sunnah/streak UI.
4. `Finance & Planning` (`6b91281906b64f349b9833777a6863c0`) for finance cards/charts/forms.
5. `Fitness Hub` (`0d6b33f452ae48b091f1378d59cd7e14`) for training modules.
6. `Hydration Tracker` (`3a86f2a1742b4fad8d167a64057b5ddd`) as a focused tracker view.
7. `Avatar & Gear` (`3cf1387959ad4ee5830e5cce8e6efcf1`) for gamification/rewards.
8. `AI Coach` (`ba0ec4e960754d26be796d3fb117b549`) for chat/coach surface.
9. `The Squad` (`9f82dd78742e4e148234ee45d8443c1c`) for social/accountability.
10. `Dashboard` variant (`5026dcee5dbb427390fd6afe80230db7`) as an alternate/expanded dashboard reference, not a separate route unless product scope requires it.

## Phase 4 - Route Mapping

Proposed production mapping:

| Stitch screen | App route |
| --- | --- |
| Dashboard | `/dashboard` |
| Daily Quests | `/quests` |
| Deen Tracker | `/deen` |
| Finance & Planning | `/finance` and `/planning` |
| Fitness Hub | `/fitness` |
| Hydration Tracker | `/hydration` |
| Avatar & Gear | `/avatar` or `/rewards` |
| AI Coach | `/coach` |
| The Squad | `/squad` |

Use `src/lib/routes.ts` for any route added or renamed.

## Phase 5 - Data Integration

1. Replace static Stitch task content with Supabase-backed daily quest data.
2. Connect finance widgets to existing transaction/budget/savings APIs.
3. Store hydration/fitness/deen progress in new Supabase tables only after UI contracts are stable.
4. Keep AI Coach guarded by prompt safety and user-owned context.
5. Add server-side ownership checks for every new write path.

## Verification Checklist

1. `npm run check`
2. `npm run build`
3. Browser check on desktop and mobile viewport.
4. Confirm auth bypass still allows local review.
5. Confirm Clerk-protected mode still redirects correctly when bypass is disabled.
