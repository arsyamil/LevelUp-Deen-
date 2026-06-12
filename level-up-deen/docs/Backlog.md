# Product Backlog — Level Up Deen

> Daftar backlog lengkap berdasarkan PRD v1.1, Architecture, Business Rules, Security, Compliance, AI Spec, dan Dev Guide.

---

## Prioritas

| Label | Arti |
|-------|------|
| **P0** | Must-have MVP, blocker jika tidak ada |
| **P1** | Penting untuk MVP, tapi bisa di-phase |
| **P2** | Nice-to-have MVP atau v1.1 |
| **P3** | v1.1+ / Future |

---

## Fase 1 — Fondasi MVP

### 1.1 Project Setup & Infra

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| SETUP-01 | Setup Next.js 14 + TypeScript + Tailwind + shadcn/ui | P0 | Architecture §1 | ✅ Done |
| SETUP-02 | Setup Supabase project (Auth, DB, Storage) | P0 | Architecture §2.3 | ⬜ Todo |
| SETUP-03 | Setup Vercel deployment + CI/CD dari GitHub | P0 | Architecture §1 | ⬜ Todo |
| SETUP-04 | PWA manifest + service worker dasar | P0 | PRD NFR-02 | 🔶 Partial |
| SETUP-05 | Environment variables template + .env.local.example | P0 | Dev Guide §8 | ✅ Done |
| SETUP-06 | ESLint + Prettier + commit convention setup | P1 | Dev Guide §4, §6 | 🔶 Partial |
| SETUP-07 | Content Security Policy headers | P1 | Security §4.4 | ⬜ Todo |

### 1.2 Database Schema & Migrations

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| DB-01 | Migration: `users_profile` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-02 | Migration: `user_stats` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-03 | Migration: `task_templates` table + seed mandatory prayers | P0 | PRD §13.1, Business Rules §2.3 | ⬜ Todo |
| DB-04 | Migration: `user_tasks` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-05 | Migration: `daily_task_logs` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-06 | Migration: `water_logs` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-07 | Migration: `financial_categories` + seed default categories | P0 | Business Rules §10.2 | ⬜ Todo |
| DB-08 | Migration: `financial_transactions` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-09 | Migration: `budgets` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-10 | Migration: `savings_goals` table | P0 | PRD §13.1 | ⬜ Todo |
| DB-11 | Migration: `items` table + seed shop items | P1 | PRD §13.1, Lampiran B | ⬜ Todo |
| DB-12 | Migration: `user_inventory` table | P1 | PRD §13.1 | ⬜ Todo |
| DB-13 | Migration: `achievements` + `user_achievements` tables | P1 | PRD §13.1 | ⬜ Todo |
| DB-14 | Migration: `recovery_quest_logs` table | P1 | PRD §13.1 | ⬜ Todo |
| DB-15 | Migration: `sync_queue_logs` table | P2 | PRD §13.1 | ⬜ Todo |
| DB-16 | Migration: `audit_logs` table | P1 | Security §5.2 | ⬜ Todo |
| DB-17 | RLS policies untuk semua tabel user-facing | P0 | Security §3.1-3.2 | ⬜ Todo |
| DB-18 | DB functions: EXP calculation + level-up trigger | P0 | Business Rules §3-4 | ⬜ Todo |
| DB-19 | DB indexes: composite `(user_id, log_date)` | P1 | Architecture §5.2 | ⬜ Todo |

### 1.3 Authentication

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| AUTH-01 | Register page (email/password via Clerk) | P0 | FR-AUTH-01 | ✅ Done |
| AUTH-02 | Login page (email/password via Clerk) | P0 | FR-AUTH-02 | ✅ Done |
| AUTH-03 | Google OAuth login | P1 | FR-AUTH-03 | ⬜ Todo |
| AUTH-04 | Server-side Clerk guards for protected pages/APIs | P0 | Security §2.3 | ✅ Done |
| AUTH-05 | Redirect unauthenticated → /login | P0 | Architecture §2.2 | ✅ Done |
| AUTH-06 | Redirect non-onboarded → /onboarding | P0 | Architecture §2.2 | ✅ Done |
| AUTH-07 | OAuth callback handled by Clerk | P1 | Architecture §2.2 | ✅ Done |
| AUTH-08 | Supabase server client utility | P0 | Architecture §3.3 | ✅ Done |
| AUTH-09 | Supabase browser client utility | P0 | Architecture §3.3 | ✅ Done |

### 1.4 Onboarding

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| ONB-01 | Multi-step onboarding UI (profil, spiritual, fisik, air, finansial) | P0 | FR-ONB-01, Business Rules §11 | 🔶 Partial |
| ONB-02 | Personalization engine: generate default tasks + targets | P0 | FR-ONB-02 | ⬜ Todo |
| ONB-03 | Auto-create mandatory prayer tasks (non-deletable) | P0 | Business Rules §2.3 | ⬜ Todo |
| ONB-04 | Rekomendasi reminder time | P2 | FR-ONB-03 | ⬜ Todo |
| ONB-05 | Set `onboarding_completed = true` setelah selesai | P0 | FR-AUTH-05 | ⬜ Todo |
| ONB-06 | Zod validation untuk onboarding input | P0 | Dev Guide §4.1 | 🔶 Partial |

### 1.5 Dashboard Utama

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| DASH-01 | Avatar display + level + rank + EXP bar + coin | P0 | FR-DB-01 | 🔶 Partial |
| DASH-02 | Daily progress + streak counters | P0 | FR-DB-02 | 🔶 Partial |
| DASH-03 | Quick stats cards (deen/fitness/water/finance %) | P0 | FR-DB-03 | 🔶 Partial |
| DASH-04 | Budget warning card | P1 | FR-DB-04 | 🔶 Partial |
| DASH-05 | Savings goal card | P1 | FR-DB-05 | ⬜ Todo |
| DASH-06 | Activity feed | P2 | FR-DB-05 | ⬜ Todo |
| DASH-07 | Connect dashboard ke real Supabase data | P0 | — | ⬜ Todo |

---

## Fase 2 — Tracker & Quest Inti

### 2.1 Daily Quest System

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| QUEST-01 | Tampilkan quest per kategori (mandatory/recommended/custom/bonus) | P0 | FR-DQ-01 | 🔶 Partial |
| QUEST-02 | Self-check completion (toggle task selesai) | P0 | FR-DQ-02 | ⬜ Todo |
| QUEST-03 | Input actual value untuk task numerik | P0 | FR-DQ-03 | ⬜ Todo |
| QUEST-04 | Server Action: completeTask + EXP/coin calc | P0 | FR-DQ-04, Architecture §3.2 | ⬜ Todo |
| QUEST-05 | Tombol "Complete All" eligible tasks | P2 | FR-DQ-05 | ⬜ Todo |
| QUEST-06 | Real-time EXP animation on completion | P1 | PRD §15.2 | ⬜ Todo |
| QUEST-07 | Daily log persistence per `log_date` + timezone | P0 | Business Rules §9.1 | ⬜ Todo |

### 2.2 Deen Tracker

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| DEEN-01 | Checklist shalat 5 waktu | P0 | FR-DEEN-01 | 🔶 Partial |
| DEEN-02 | Tracking tilawah/sedekah/dzikir/dhuha/tahajud/hafalan | P0 | FR-DEEN-02 | ⬜ Todo |
| DEEN-03 | Custom sunnah task CRUD | P1 | FR-DEEN-03 | ⬜ Todo |
| DEEN-04 | Prayer streak + spiritual dashboard | P0 | FR-DEEN-04 | 🔶 Partial |
| DEEN-05 | Enforce shalat non-deletable (`is_deletable=false`) | P0 | FR-DEEN-05 | ⬜ Todo |

### 2.3 Fitness Tracker

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| FIT-01 | Input lari (jarak/durasi) | P0 | FR-FIT-01 | 🔶 Partial |
| FIT-02 | Input push up/pull up/squat (reps) | P0 | FR-FIT-02 | 🔶 Partial |
| FIT-03 | Custom workout input | P1 | FR-FIT-03 | ⬜ Todo |
| FIT-04 | Progress chart mingguan (Recharts) | P1 | FR-FIT-04 | ⬜ Todo |
| FIT-05 | EXP reward berbasis effort | P0 | FR-FIT-05 | ⬜ Todo |

### 2.4 Water Tracker

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| WATER-01 | Target hidrasi harian (ml/gelas) | P0 | FR-WATER-01 | 🔶 Partial |
| WATER-02 | Quick add buttons (250/500/750 ml) | P0 | FR-WATER-02 | 🔶 Partial |
| WATER-03 | Progress bar / circular progress | P0 | FR-WATER-03 | 🔶 Partial |
| WATER-04 | Reminder minum (push notification) | P2 | FR-WATER-04 | ⬜ Todo |
| WATER-05 | EXP saat target harian tercapai | P1 | FR-WATER-05 | ⬜ Todo |

### 2.5 Gamification Engine

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| GAME-01 | EXP calculation engine (proportional + boolean) | P0 | FR-GAME-01, Business Rules §3.2 | 🔶 Partial |
| GAME-02 | Level-up logic (formula: `100 + level*50`) | P0 | FR-GAME-01, Business Rules §4 | 🔶 Partial |
| GAME-03 | Rank mapping berdasarkan level (E→S+) | P0 | FR-GAME-02, Business Rules §5 | 🔶 Partial |
| GAME-04 | Coin award logic (prayers, streaks, milestones) | P0 | Business Rules §6 | ⬜ Todo |
| GAME-05 | Daily streak calculation + freeze logic | P0 | FR-GAME-03, Business Rules §7 | ⬜ Todo |
| GAME-06 | Weekly streak calculation | P1 | FR-GAME-03 | ⬜ Todo |
| GAME-07 | Achievement unlock checker | P1 | FR-GAME-04, Business Rules §13 | ⬜ Todo |
| GAME-08 | Streak milestone rewards (3/7/14/30/60/100 hari) | P1 | Business Rules §7.2 | ⬜ Todo |
| GAME-09 | Recovery quest trigger (2 hari berturut gagal) | P1 | FR-GAME-05, Business Rules §8 | ⬜ Todo |
| GAME-10 | Recovery quest UI + options | P1 | Business Rules §8.3 | ⬜ Todo |

### 2.6 Streak & Daily Log Edge Cases

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| EC-01 | Status default `pending` sampai cut-off 23:59 timezone | P0 | PRD EC-01 | ⬜ Todo |
| EC-02 | Auto `skipped` jika >1 hari tidak diisi | P1 | PRD EC-02 | ⬜ Todo |
| EC-03 | Block backfill mandatory prayer setelah cut-off | P0 | PRD EC-03 | ⬜ Todo |
| EC-04 | Late note mode (non-EXP) untuk catatan keterlambatan | P2 | PRD EC-03, Business Rules §9.2 | ⬜ Todo |
| EC-07 | Background job rekalkulasi EXP jika server calc gagal | P2 | PRD EC-07 | ⬜ Todo |

---

## Fase 3 — Finance Module

### 3.1 Finance Tracker

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| FIN-01 | Input transaksi harian (income/expense) | P0 | FR-FIN-01 | 🔶 Partial |
| FIN-02 | Kategori transaksi (default + custom CRUD) | P0 | FR-FIN-02 | ⬜ Todo |
| FIN-03 | Riwayat + filter transaksi | P0 | FR-FIN-03 | ⬜ Todo |
| FIN-04 | Ringkasan total harian dan bulanan | P0 | FR-FIN-04 | ⬜ Todo |
| FIN-05 | Integrasi budget warning + savings progress | P1 | FR-FIN-05 | ⬜ Todo |
| FIN-06 | Zod validation untuk transaction input | P0 | Security §3.4 | ⬜ Todo |

### 3.2 Finance Planning

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| PLAN-01 | Budget per kategori per bulan | P0 | FR-PLAN-01 | 🔶 Partial |
| PLAN-02 | Alert threshold 80% + over-budget 100% | P0 | FR-PLAN-02, Business Rules §10.3 | ⬜ Todo |
| PLAN-03 | Savings goal CRUD (nama, nominal, target date) | P0 | FR-PLAN-03 | ⬜ Todo |
| PLAN-04 | Cashflow dashboard (income vs expense chart) | P1 | FR-PLAN-04 | 🔶 Partial |
| PLAN-05 | Laporan bulanan per kategori | P2 | FR-PLAN-05 | ⬜ Todo |

---

## Fase 4 — Avatar & Shop

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| AVA-01 | Avatar dark fantasy display | P1 | FR-AVA-01 | 🔶 Partial |
| AVA-02 | Item shop UI (skin, aura, frame, title, badge) | P1 | FR-AVA-02 | 🔶 Partial |
| AVA-03 | Purchase logic: validate coin + unlock level | P1 | FR-AVA-03, Business Rules §14.2 | ⬜ Todo |
| AVA-04 | Inventory page + equip/unequip | P1 | FR-AVA-04 | ⬜ Todo |
| AVA-05 | Item rarity system (common→legendary) | P2 | Business Rules §14.3 | ⬜ Todo |
| AVA-06 | Seed shop items data | P1 | Lampiran B | ⬜ Todo |

---

## Fase 5 — Settings & User Management

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| SET-01 | Edit profil (username, nama, timezone) | P0 | FR-SET-01 | 🔶 Partial |
| SET-02 | Edit reminder settings | P1 | FR-SET-01 | 🔶 Partial |
| SET-03 | Edit target harian | P1 | FR-SET-02 | ⬜ Todo |
| SET-04 | Kelola custom tasks | P1 | FR-SET-03 | ⬜ Todo |
| SET-05 | Kelola kategori keuangan | P1 | FR-SET-04 | ⬜ Todo |
| SET-06 | Export data (JSON/CSV) | P1 | FR-SET-05, Compliance §3.4 | ⬜ Todo |
| SET-07 | Delete account + cascade semua data | P1 | FR-SET-05, Compliance §3.5 | ⬜ Todo |

---

## Non-Functional & Cross-Cutting

### PWA & Offline

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| PWA-01 | Service worker strategy safe for auth + deploy updates | P0 | NFR-02, Architecture §2.1 | ⬜ Todo |
| PWA-02 | Install prompt (add to home screen) | P1 | NFR-02 | ⬜ Todo |
| PWA-03 | Offline queue (IndexedDB) untuk checklist + transaksi | P1 | NFR-09, Business Rules §12 | ⬜ Todo |
| PWA-04 | Sync manager: auto-replay queue saat online | P1 | NFR-10, PRD EC-04/05 | ⬜ Todo |
| PWA-05 | Badge "belum sinkron" di UI | P1 | PRD EC-04 | ⬜ Todo |
| PWA-06 | Conflict resolution (last-write-wins + immutable logs) | P2 | PRD EC-06, Business Rules §12.2 | ⬜ Todo |
| PWA-07 | Retry button + failed sync list | P2 | Business Rules §12.3 | ⬜ Todo |

### Push Notifications

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| NOTIF-01 | Web Push setup (VAPID keys) | P2 | Architecture §1 | ⬜ Todo |
| NOTIF-02 | Prayer time reminders | P2 | FR-ONB-03 | ⬜ Todo |
| NOTIF-03 | Water reminder | P2 | FR-WATER-04 | ⬜ Todo |
| NOTIF-04 | Streak warning (about to break) | P2 | — | ⬜ Todo |
| NOTIF-05 | Budget warning push | P2 | — | ⬜ Todo |

### Performance & Quality

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| PERF-01 | TTI ≤ 3s pada 4G | P0 | NFR-03 | ⬜ Todo |
| PERF-02 | Mobile responsive ≥ 360px | P0 | NFR-01 | 🔶 Partial |
| PERF-03 | Skeleton loading states | P1 | Compliance §5.2 | ⬜ Todo |
| PERF-04 | Image optimization (next/image, WebP) | P2 | Architecture §5.2 | ⬜ Todo |
| PERF-05 | Bundle analyzer setup | P2 | Architecture §5.2 | ⬜ Todo |

### Security & Audit

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| SEC-01 | RLS policies: semua tabel verified | P0 | Security §3.1 | ⬜ Todo |
| SEC-02 | Zod validation: semua API endpoints | P0 | Security §3.4 | ⬜ Todo |
| SEC-03 | Audit log: auth events | P1 | Security §5.1, Compliance §6.1 | ⬜ Todo |
| SEC-04 | Audit log: finance + gamification events | P1 | Security §5.1 | ⬜ Todo |
| SEC-05 | Financial data never exposed publicly | P0 | Security §3.3, Compliance §3.2 | ⬜ Todo |
| SEC-06 | Rate limiting on sensitive APIs | P2 | Security §6 | ⬜ Todo |

### Analytics & Event Tracking

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| TRACK-01 | Event tracking service setup | P1 | PRD §6.4 | ⬜ Todo |
| TRACK-02 | Track: `onboarding_completed` | P1 | PRD §6.4 | ⬜ Todo |
| TRACK-03 | Track: `quest_completed`, `streak_updated` | P1 | PRD §6.4 | ⬜ Todo |
| TRACK-04 | Track: `level_up`, `transaction_logged` | P1 | PRD §6.4 | ⬜ Todo |
| TRACK-05 | Track: `budget_warning_shown`, `item_purchased` | P2 | PRD §6.4 | ⬜ Todo |
| TRACK-06 | KPI dashboard (7d/30d/90d views) | P2 | PRD §6.4 | ⬜ Todo |

### Testing

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| TEST-01 | Unit tests: gamification engine (EXP, level, streak) | P0 | Dev Guide §7 | ⬜ Todo |
| TEST-02 | Unit tests: RLS policies | P0 | Dev Guide §7 | ⬜ Todo |
| TEST-03 | Integration tests: Server Actions | P1 | Dev Guide §7 | ⬜ Todo |
| TEST-04 | E2E tests: auth flow | P1 | Dev Guide §7 | ⬜ Todo |
| TEST-05 | E2E tests: quest completion loop | P2 | Dev Guide §7 | ⬜ Todo |

---

## Fase 5 — v1.1: Social Retention Lite

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| SOC-01 | Mini leaderboard (completion score, bukan ibadah detail) | P3 | FR-SOC-01 | ⬜ Todo |
| SOC-02 | Squad kecil (2-5 user) | P3 | FR-SOC-02 | ⬜ Todo |
| SOC-03 | Granular privacy controls | P3 | FR-SOC-03 | ⬜ Todo |
| SOC-04 | Squad activity feed (progres umum saja) | P3 | FR-SOC-04 | ⬜ Todo |
| SOC-05 | Opt-in push reminder berbasis squad | P3 | FR-SOC-05 | ⬜ Todo |
| SOC-06 | DB: `squad_groups`, `squad_members`, `leaderboard_snapshots` | P3 | PRD §13.1 | ⬜ Todo |

---

## Fase 5 — v1.1: AI Features

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| AI-01 | AI Gateway infrastructure + rate limiting | P3 | AI Spec §2 | ⬜ Todo |
| AI-02 | Policy Layer (moderation + Islamic guardrails) | P3 | AI Spec §4 | 🔶 Partial |
| AI-03 | Feature Store (7d/30d metric aggregation) | P3 | AI Spec §2.2 | ⬜ Todo |
| AI-04 | AI Coach chat UI + disclaimer | P3 | FR-AI-COACH-01/03, AI Spec §3.1 | 🔶 Partial |
| AI-05 | AI Coach system prompt + context injection | P3 | AI Spec §3.1 | ⬜ Todo |
| AI-06 | Smart Quest: failure pattern detection | P3 | FR-AI-QUEST-01, AI Spec §3.2 | ⬜ Todo |
| AI-07 | Smart Quest: micro-habit recommendation UI | P3 | FR-AI-QUEST-02/03 | ⬜ Todo |
| AI-08 | Finance NL parser (bahasa natural → transaksi) | P3 | FR-AI-FIN-01, AI Spec §3.3 | 🔶 Partial |
| AI-09 | Finance category prediction | P3 | FR-AI-FIN-02 | ⬜ Todo |
| AI-10 | Weekly spending insight (suportif) | P3 | FR-AI-FIN-03 | ⬜ Todo |
| AI-11 | Savings goal forecasting | P3 | FR-AI-GOAL-01/02 | 🔶 Partial |
| AI-12 | What-if simulation untuk savings | P3 | FR-AI-GOAL-03 | ⬜ Todo |
| AI-13 | Fallback rule-based engine | P3 | AI Spec §4.4 | ⬜ Todo |
| AI-14 | DB: `ai_conversations`, `ai_recommendations`, `ai_finance_parse_logs` | P3 | AI Spec §4.4 | ⬜ Todo |
| AI-15 | AI audit logging | P3 | AI Spec §4.4, Compliance §4 | ⬜ Todo |

---

## Fase 6+ — Future

| ID | Item | Priority | Ref | Status |
|----|------|----------|-----|--------|
| FUT-01 | Dynamic Avatar Evolution (aura adaptif per pilar) | P3 | FR-AI-AVA-01/02/03 | ⬜ Todo |
| FUT-02 | Guild / party system | P3 | PRD §3.3 | ⬜ Todo |
| FUT-03 | Social challenge komunitas | P3 | PRD §3.3 | ⬜ Todo |
| FUT-04 | Google Fit / Strava integration | P3 | PRD §12.2 | ⬜ Todo |
| FUT-05 | Advanced AI coach + analytics | P3 | PRD §17.6 | ⬜ Todo |
| FUT-06 | Multi-language support | P3 | — | ⬜ Todo |

---

## Ringkasan Status

| Status | Count | Keterangan |
|--------|------:|------------|
| ✅ Done | 5 | Selesai dan verified |
| 🔶 Partial | 28 | UI prototype ada, belum connected ke real data/logic |
| ⬜ Todo | 82 | Belum dikerjakan |
| **Total** | **115** | |

### Per Priority

| Priority | Total | Done | Partial | Todo |
|----------|------:|-----:|--------:|-----:|
| P0 | 35 | 3 | 10 | 22 |
| P1 | 37 | 0 | 9 | 28 |
| P2 | 21 | 1 | 1 | 19 |
| P3 | 22 | 1 | 8 | 13 |

---

*Last updated: 2026-05-15*
*Source: PRD v1.1, Architecture.md, Business_Rules.md, Security.md, Compliance.md, AI_Spec.md, Dev_Guide.md*
