# Design Reference

## Tujuan
File ini memudahkan pengembangan UI baru dengan pedoman visual, pola komponen, dan struktur halaman yang sudah digunakan dalam proyek.

## Prinsip Desain
- Konsisten: gunakan komponen `Card`, `ProgressBar`, dan utilitas Tailwind yang sudah ada.
- Ringkas: tampilan harus bersih, fokus ke data pengguna, dan mudah dibaca.
- Mobile-first: desain responsif dengan grid sederhana dan card yang mudah diletakkan.
- Aksesibilitas: gunakan teks kontras, label form jelas, dan interaksi tombol yang mudah dikenali.

## Struktur UI saat ini
- `src/components/ui/card.tsx` — wrapper card standar dengan kelas `surface-card`
- `src/components/ui/progress-bar.tsx` — progress bar sederhana dengan kemajuan persentase
- `src/lib/cn.ts` — helper class name untuk menggabungkan kelas string
- `src/components/onboarding/onboarding-form.tsx` — form onboarding interaktif
- `src/components/quests/quest-list.tsx` — daftar tugas harian dengan aksi status

## Kerangka Halaman
Gunakan pola berikut ketika menambahkan halaman baru:
1. Buat file `src/app/(app)/nama-halaman/page.tsx`
2. Jika halaman memerlukan data terhubung, gunakan fungsi server di `src/lib/*` atau route API di `src/app/api/*`
3. Bungkus bagian utama dengan `<Card className="p-5">` atau `<Card className="p-6">`
4. Tambahkan judul dengan teks `text-2xl font-semibold`
5. Tambahkan deskripsi ringkas dengan teks `text-sm text-text-dim`

## Komponen & Pola
### Card
Gunakan `Card` sebagai kontainer utama untuk blok konten, formulir, atau ringkasan statistik.

### Progress bar
Gunakan `ProgressBar` untuk menampilkan kemajuan eksplisit, baik level EXP atau tugas harian.

### Tombol
- Gunakan kelas `rounded-2xl` untuk sudut group modern
- `bg-brand` untuk tombol utama
- `border border-line` untuk tombol sekunder / outline
- `disabled:opacity-60` untuk keadaan disable

### Layout grid
- `space-y-6` untuk jarak vertikal antar-seksi
- `grid gap-4 sm:grid-cols-2 xl:grid-cols-4` untuk kartu statistik
- `grid gap-4 xl:grid-cols-[1.2fr_0.8fr]` untuk layout konten + sidebar

## Warna dan Tema
Proyek menggunakan variabel CSS pada root (`--background`, `--foreground`, dll.), dan Tailwind untuk warna utilitas:
- `bg-bg`, `bg-bg-soft`, `text-text`, `text-text-dim`
- `border-line`, `bg-brand`, `text-brand`
- `text-success`, `text-danger`

## Halaman Utama yang Ada
- `dashboard` — ringkasan progress harian, EXP, dan statistik tugas
- `onboarding` — input profil dan personalisasi plan
- `quests` — daftar tugas harian dan task custom
- `deen`, `fitness`, `finance`, `planning`, `squad`, `water`, `avatar`, `settings`

## Alur UI yang Dianjurkan
1. Halaman utama menampilkan ringkasan progress dan CTA ke onboarding / quests.
2. Onboarding mengumpulkan data user, lalu menyimpan preferensi di Supabase dan Clerk.
3. Quest muncul sebagai card yang bisa di-mark selesai atau skip.
4. Dashboard menerima data aktif dari database user dan menampilkan progress secara real-time.

## Pedoman Pengembangan Komponen Baru
- Buat komponen kecil dan bisa dipakai ulang di `src/components`.
- Jika komponen memerlukan state/efek browser, gunakan `"use client"`.
- Untuk UI statis/data-fetch server, gunakan komponen server default.
- Simpan tipe data di `src/lib/types.ts` agar komponen konsisten.

## Tips Tambahan
- gunakan `use client` hanya pada file yang butuh interaksi atau state
- hindari over-styling; manfaatkan utility class Tailwind dan komponen `Card`
- selalu beri fallback teks ketika data kosong
- gunakan variabel kelas yang jelas seperti `section-title` atau `text-text-dim`

## Rekomendasi untuk Fitur Baru
- `task history` / `activity feed` untuk melihat asumsi completion harian
- `achievement` atau `reward panel` untuk memberikan feedback saat user mencapai milestone
- `smart recommendation card` untuk menyarankan task berdasarkan onboarding / user type
- `goal tracker` yang memvisualisasikan nilai target air, tilawah, dan workout

## Kapan Menambahkan Pola Baru
Tambahkan pola desain baru jika kamu memiliki lebih dari dua halaman dengan kebutuhan visual sama. Contoh:
- layout landing dengan summary + detail panel
- card checklist dengan state `completed` / `pending` / `skipped`
- badge / pill untuk status dan kategori

---

File ini dibuat untuk menjadi referensi cepat sebelum menambahkan UI baru atau memperluas fitur desain di proyek.