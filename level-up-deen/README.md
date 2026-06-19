# Level Up Deen - MVP Codebase Foundation

Codebase awal untuk platform pengembangan diri harian berbasis gamifikasi Islami sesuai PRD v1.1.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth (email/password session)
- Supabase (PostgreSQL, RLS-ready, Storage-ready)
- PWA manifest retained; service-worker caching is currently disabled with a cleanup worker

## Fitur yang Sudah Di-scaffold
- Landing page + app shell modular
- Modul halaman MVP:
  - `/dashboard`
  - `/onboarding`
  - `/quests`
  - `/deen`
  - `/fitness`
  - `/water`
  - `/finance`
  - `/planning`
  - `/avatar`
  - `/settings`
- Modul kandidat v1.1:
  - `/ai-coach`
  - `/squad`
- API routes awal:
  - `GET /api/health`
  - `GET/POST /api/tasks`
  - `POST /api/tasks/complete`
  - `GET/POST/PATCH/DELETE /api/finance/transactions`
  - `GET/POST/PATCH/DELETE /api/planning/budgets`
  - `GET/POST/PATCH/DELETE /api/planning/savings-goals`
  - `GET/POST /api/avatar`
  - `GET/PATCH /api/settings/profile`
  - `GET /api/settings/export`
  - `POST /api/settings/delete-request`
  - `GET /api/gamification/preview?totalExp=...`
  - `POST /api/ai/coach`
  - `POST /api/ai/finance-parse`
  - `POST /api/ai/quest-recommendation`
- SQL migration lengkap:
  - `supabase/migrations/202605010001_init_level_up_deen.sql`

## Menjalankan Proyek
1. Install dependencies
```bash
npm ci
```

2. Copy environment
```bash
cp .env.example .env.local
```

3. Isi variabel Supabase di `.env.local`
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
AUTH_BYPASS_ENABLED=false
```

4. Jalankan dev server
```bash
npm run dev
```

5. Buka
- [http://localhost:3000](http://localhost:3000)

## Quality Checks
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Test: `npm run test`
- Local sanity check: `npm run doctor`
- Full check: `npm run check`
- Bersihkan cache lokal: `npm run clean`

## Catatan Implementasi
- Auth menggunakan Supabase Auth sebagai sumber identitas. `src/proxy.ts` menyegarkan sesi Supabase, sementara route protection tetap dilakukan di Server Components/API routes via `src/lib/auth.ts`.
- Sebagian besar alur inti sudah membaca/menulis ke Supabase melalui server-side admin client dengan filter `user_id`.
- Jalur workflow utama didefinisikan di `src/lib/routes.ts`.
- PWA caching sedang dimatikan; `public/sw.js` hanya membersihkan service worker/cache lama.

## Struktur Penting
- `src/app/(app)` - semua halaman modul produk
- `src/lib` - domain logic dan data layer helper
- `src/features` - schema dan guardrail
- `supabase/migrations` - schema database + RLS + trigger
- `public/sw.js` + `src/app/manifest.ts` - manifest dan cleanup PWA cache
- `docs/Runtime_Runbook.md` - runbook runtime/deploy/auth/env
- `docs/Document_Audit_0d528d9c-ba71-4d84-9197-bfc9263f6ebd.md` - hasil audit dokumen/workflow

## Next Steps (Disarankan)
1. Tambahkan regression test untuk login/register, onboarding, dashboard, dan admin guard.
2. Selesaikan observability event untuk KPI (DAU, D7, D30, MDCR).
3. Re-enable PWA caching hanya setelah browser cache regression test tersedia.
4. Rapikan backlog AI agar sesuai implementasi Gemini saat ini atau target AI Gateway baru.
