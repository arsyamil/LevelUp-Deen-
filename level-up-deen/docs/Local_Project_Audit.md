# Local Project Audit

Tanggal audit: 2026-06-19

## Ringkasan

Project sudah dibersihkan dari artefak lokal, output build, arsip besar, file duplikat, dan aset desain mentah yang tidak diperlukan untuk deploy aplikasi Next.js.

Berat terbesar saat ini berasal dari `node_modules`, bukan dari source aplikasi. Ini normal untuk pengembangan lokal dan tidak ikut ter-deploy ketika memakai platform seperti Vercel/Netlify selama dependency install dilakukan dari `package-lock.json`.

## Bagian yang Ditandai Tidak Diperlukan

File dan folder berikut sudah ditandai sebagai sampah/generated dan dihapus atau diabaikan:

- `.next/` - output build lokal Next.js.
- `.vercel/output/` - output deploy lokal Vercel.
- `tsconfig.tsbuildinfo` - cache TypeScript lokal.
- `.DS_Store`, `*.swp`, `docs/.Rhistory` - file lokal/editor.
- `* 2.*` - file duplikat hasil copy manual.
- `*.zip` - arsip dokumentasi/desain yang tidak dipakai runtime.
- `public/workbox-*.js`, `public/worker-*.js`, `public/swe-worker-*.js` - artefak service worker lama.
- `stitch-assets/` - ekspor desain mentah HTML/PNG/JSON, bukan source aplikasi produksi.

## Perubahan Optimasi

- Menghapus dependency PWA lama `@ducanh2912/next-pwa`.
- Mengganti service worker lama dengan cleanup worker kecil di `public/sw.js`.
- Menambahkan `.vercelignore` agar aset mentah, cache, dan dokumen non-runtime tidak ikut deploy.
- Menambahkan script `clean` untuk membersihkan output lokal.
- Menambahkan script `doctor` untuk validasi lokal cepat.
- Memigrasikan konfigurasi ESLint ke flat config yang kompatibel dengan Next.js 16.
- Memigrasikan Middleware Next.js lama ke `src/proxy.ts`.
- Memperbarui API cookies async untuk kompatibilitas Next.js 16.
- Memperbarui dokumentasi supaya konsisten dengan Supabase Auth sebagai sumber identitas utama.

## Status Ukuran Lokal

Snapshot setelah cleanup:

- Project total: sekitar `539M`
- `node_modules`: sekitar `538M`
- `src`: sekitar `876K`
- `public`: sekitar `24K`
- `docs`: sekitar `144K`

Catatan: source aplikasi sudah ringan. Ukuran lokal tetap besar karena dependency development modern.

## Rekomendasi Deploy

- Jangan deploy `node_modules`; biarkan platform menjalankan `npm ci`.
- Gunakan `npm run check` sebagai validasi sebelum deploy.
- Jalankan `npm run clean` sebelum membuat arsip/manual upload.
- Simpan ekspor desain mentah di luar repo atau di storage terpisah bila masih dibutuhkan.
- Pertahankan `stitch-assets/` di `.gitignore` karena bukan bagian runtime.
- Jangan mengaktifkan cache PWA produksi sebelum strategi invalidasi dan update siap.

## Rekomendasi Lokal

- Gunakan Node.js sesuai `package.json`, yaitu `>=20.9 <25`.
- Gunakan `npm ci` untuk instalasi bersih dari lockfile.
- Gunakan `npm run doctor` untuk cek cepat TypeScript dan test.
- Gunakan `npm run check` sebelum push/deploy.
- Gunakan `npm run clean` bila folder `.next` mulai membesar.

## Paket Major yang Belum Dinaikkan

Paket berikut masih memiliki major version lebih baru, tetapi tidak dinaikkan otomatis karena berisiko mengubah konfigurasi besar:

- `tailwindcss` 3 ke 4.
- `typescript` 5 ke 6.
- `eslint` 9 ke 10.
- `@types/node` 20 ke 26.

Keputusan saat ini: tahan di versi stabil yang lolos lint, typecheck, test, audit, dan build.

## Verifikasi Terakhir

- `npm run doctor` lulus.
- `npm run check` lulus.
- `npm audit --audit-level=moderate` lulus dengan 0 vulnerability.
- Scan file sampah umum kosong setelah cleanup.
