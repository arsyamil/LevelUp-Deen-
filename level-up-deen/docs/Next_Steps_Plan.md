# Next Steps Plan — Level Up Deen

## Tujuan Terdekat

Menstabilkan fondasi Clerk + Supabase, lalu mengubah halaman yang masih memakai mock data menjadi alur MVP yang benar-benar menyimpan dan membaca data user.

## Status Saat Ini

- Clerk menjadi sumber autentikasi dan otorisasi utama.
- Supabase dipakai sebagai persistence layer.
- User ID di migrasi sudah diselaraskan menjadi `text` agar kompatibel dengan Clerk ID.
- Route workflow utama sudah dikonsolidasikan di `src/lib/routes.ts`.
- `npm run check` sudah mencakup workflow verification, lint, typecheck, dan build.
- Onboarding menyiapkan mandatory prayer tasks dan mencegah duplikasi task berbasis template.
- Finance sudah mendukung create/list/edit/delete transaksi dengan ownership berbasis Clerk user ID.
- Finance sudah punya filter bulanan dan ringkasan income/expense per kategori.
- Planning sudah membaca budget dan savings goals aktif dari Supabase untuk user saat ini.
- Planning sudah punya form create/edit/delete budget dan create/edit/archive savings goal.
- Settings sudah membaca dan mengupdate profile dari `users_profile`.
- Mutasi finance, planning, dan settings sudah menulis audit umum ke `system_audit_logs`.
- Admin audit page sudah menampilkan audit role dan audit mutasi sistem.
- Task creation dan task completion reward sudah menulis audit umum.
- Settings sudah menyediakan export data user dalam format JSON.
- Settings sudah menyediakan request delete account non-destruktif.
- Admin audit page sudah menampilkan request delete account.

## Fase 1 — Stabilkan Database Dan Auth

1. Jalankan migration Supabase terbaru:
   - `202606030002_align_user_ids_with_clerk.sql`
   - Pastikan tabel lama yang memakai UUID user ID berhasil dikonversi ke `text`.

2. Verifikasi Clerk metadata:
   - Pastikan admin punya `publicMetadata.role = "admin_system"`.
   - Pastikan user biasa default ke role `user`.

3. Tambahkan test auth minimal:
   - Public route dapat dibuka: `/`, `/login`, `/register`.
   - Protected route redirect ke login jika belum auth.
   - User belum onboarding redirect ke `/onboarding`.
   - Admin route menolak non-admin.

## Fase 2 — Real Data Untuk Core Loop

1. Onboarding:
   - Profile dibuat otomatis jika belum ada.
   - Onboarding membuat default tasks tanpa duplikasi.
   - Mandatory prayer tasks sudah disiapkan sebagai non-deletable.
   - Lanjutkan dengan validasi end-to-end memakai user Clerk nyata dan database Supabase.

2. Daily Quest:
   - Tambahkan input actual value untuk task numerik.
   - Pastikan reward EXP/coin tetap idempotent per user/task/tanggal.
   - Tambahkan riwayat reward yang mudah diaudit.

3. Dashboard:
   - Ganti semua statistik mock dengan query Supabase.
   - Tambahkan loading, empty state, dan error state yang jelas.

## Fase 3 — Migrasi Halaman Mock Data

Prioritas halaman:

1. `deen`
   - Checklist shalat 5 waktu dari `user_tasks` sudah terhubung.
   - Streak ibadah dari `user_stats` sudah ditampilkan.
   - Lanjutkan dengan aksi checklist langsung dari halaman Deen atau tetap arahkan ke Daily Quest.

2. `finance`
   - Create/list transaksi dari `financial_transactions` sudah terhubung.
   - Edit/delete transaksi sudah tersedia di API dan UI.
   - Filter per bulan dan ringkasan kategori sudah tersedia.
   - Kategori dari `financial_categories` dibuat otomatis dari input transaksi.
   - Lanjutkan dengan audit log mutasi finance dan budget usage dari halaman planning.

3. `planning`
   - Budget dari `budgets` sudah ditampilkan untuk bulan berjalan.
   - Savings goal dari `savings_goals` sudah ditampilkan dengan forecast berbasis net saving bulanan.
   - Form tambah/edit/hapus budget sudah tersedia.
   - Form tambah/edit/arsip savings goal sudah tersedia.
   - Lanjutkan dengan filter bulan planning dan audit log mutasi planning.

4. `avatar`
   - Items dari `items`.
   - Inventory dari `user_inventory`.

5. `settings`
   - Profile edit dari `users_profile` sudah tersedia.
   - Export data user sudah tersedia.
   - Request delete account sudah tersedia.
   - Admin visibility untuk delete request sudah tersedia.
   - Lanjutkan dengan reminder preferences dan admin processing action untuk delete requests.

## Fase 4 — Security Dan Reliability

1. Kurangi penggunaan `createSupabaseAdminClient` di flow user biasa.
2. Jika tetap pakai service role di server route, semua query wajib:
   - Mengambil Clerk user ID dari helper auth.
   - Filter `.eq("user_id", userId)` atau `.eq("id", userId)`.
   - Tidak menerima `user_id` dari payload client untuk operasi user biasa.

3. Tambahkan audit log untuk:
   - Role change.
   - Task completion reward sudah tersedia.
   - Task creation sudah tersedia.
   - Finance mutation sudah tersedia.
   - Planning mutation sudah tersedia.
   - Settings profile update sudah tersedia.
   - Data export sudah tersedia.
   - Data delete account request sudah tersedia.
   - Admin visibility delete account request sudah tersedia.
   - Lanjutkan dengan admin approval/processing delete account.
   - Lanjutkan dengan filter tipe audit yang lebih spesifik dan pagination.

4. Tambahkan rate limit untuk:
   - AI coach.
   - Finance parse.
   - Task mutation.

## Fase 5 — PWA Dan Offline

1. Ganti offline queue dari `localStorage` ke IndexedDB.
2. Tambahkan endpoint sync queue.
3. Tambahkan badge status:
   - Online.
   - Offline.
   - Pending sync.
   - Failed sync.

4. Re-enable service worker caching hanya setelah auth/onboarding stale-cache regression test tersedia.

## Definition Of Done MVP

- User bisa register/login dengan Clerk.
- User baru diarahkan ke onboarding.
- Onboarding membuat profile dan task awal.
- User bisa menyelesaikan daily quest dan reward tidak double.
- Dashboard membaca progress nyata.
- Admin bisa melihat user dan mengubah role.
- Build dan `npm run check` selalu lolos.
- Data user tidak bisa diakses oleh user lain lewat route/API.

## Command Validasi

```bash
npm run check
```

Untuk development:

```bash
npm run dev
```
