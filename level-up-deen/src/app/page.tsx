import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";

const features = [
  {
    icon: "🕌",
    title: "Deen Tracker",
    desc: "Checklist shalat 5 waktu, dzikir, tilawah — dengan streak harian yang memotivasimu.",
  },
  {
    icon: "💪",
    title: "Fitness & Body",
    desc: "Target push up, squat, lari adaptif berdasarkan level baseline personalmu.",
  },
  {
    icon: "💧",
    title: "Water Tracker",
    desc: "Quick-add hidrasi harian dengan pengingat interval yang bisa dikonfigurasi.",
  },
  {
    icon: "💰",
    title: "Finance Planner",
    desc: "Catat transaksi harian, budget per kategori, dan prediksi kapan tabunganmu tercapai.",
  },
  {
    icon: "🤖",
    title: "AI Life Coach",
    desc: "Asisten motivasi personal — bukan pemberi fatwa, tapi pendamping konsistensi.",
  },
  {
    icon: "🎮",
    title: "Gamifikasi",
    desc: "EXP, level, rank (E → S+), coin, dan item shop untuk menjaga semangat jangka panjang.",
  },
];

const pillars = [
  { label: "Deen", color: "bg-emerald-400", pct: 78 },
  { label: "Body", color: "bg-cyan-300", pct: 62 },
  { label: "Mind", color: "bg-amber-300", pct: 45 },
  { label: "Wealth", color: "bg-rose-300", pct: 70 },
];

const steps = [
  { n: "01", title: "Daftar & Onboarding", desc: "Isi profil, pilih tipe pengguna, dan set baseline fitness-mu dalam 3 menit." },
  { n: "02", title: "Quest Harian Otomatis", desc: "Sistem membuat quest personal berdasarkan jawabanmu — ibadah, olahraga, dan finansial." },
  { n: "03", title: "Track & Selesaikan", desc: "Centang quest, catat transaksi, tambah air minum — semua dari satu tempat." },
  { n: "04", title: "Tumbuh Setiap Hari", desc: "Kumpulkan EXP, naikkan level, buka item avatar, dan jaga streak-mu." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="container-shell flex items-center justify-between py-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand">Level Up Deen</span>
            <p className="text-sm font-semibold text-text">Self-Improvement Platform</p>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-line px-4 py-2 text-sm text-text-dim transition hover:border-brand hover:text-text"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-strong"
            >
              Mulai Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="border-b border-line">
        <div className="container-shell py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-block rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-brand">
              Platform Pengembangan Diri Islami
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-text sm:text-6xl">
              Bangun Versi Terbaik Dirimu,{" "}
              <span className="text-brand">Satu Quest Sehari</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-dim">
              Level Up Deen menggabungkan ibadah, kesehatan, dan keuangan dalam satu
              platform gamifikasi. Konsisten jadi mudah ketika terasa seperti permainan.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-brand px-8 py-4 text-base font-semibold text-black transition hover:bg-brand-strong"
              >
                Mulai Sekarang — Gratis
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border border-line px-8 py-4 text-base text-text-dim transition hover:border-brand hover:text-text"
              >
                Sudah Punya Akun
              </Link>
            </div>
          </div>

          {/* Live pillar preview */}
          <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-line bg-bg-card p-6 shadow-lg">
            <p className="mb-4 text-xs uppercase tracking-wide text-text-dim">
              Contoh Dashboard — 4 Pilar Progres
            </p>
            <div className="space-y-4">
              {pillars.map((p) => (
                <div key={p.label}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium">{p.label}</span>
                    <span className="text-text-dim">{p.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-soft">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all`}
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-b border-line">
        <div className="container-shell py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold">Semua yang Kamu Butuhkan</h2>
            <p className="mt-3 text-text-dim">
              Satu platform untuk Deen, Body, Mind, dan Wealth.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-line bg-bg-card p-6 transition hover:border-brand/40"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-b border-line">
        <div className="container-shell py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-semibold">Cara Kerjanya</h2>
            <p className="mt-3 text-text-dim">Mulai dalam menit, konsisten seumur hidup.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="space-y-3">
                <p className="text-4xl font-bold text-brand opacity-60">{s.n}</p>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-text-dim">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXP progress demo ── */}
      <section className="border-b border-line">
        <div className="container-shell py-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold">
                Setiap Kebiasaan Kecil Memberi EXP
              </h2>
              <p className="mt-4 leading-relaxed text-text-dim">
                Shalat Subuh? +20 EXP. Minum 2L air? +15 EXP. Catat pengeluaran hari ini?
                +15 EXP. Semua aksi kecil terhitung — dan level naik tanpa kamu sadari.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  ["Rank E → S+", "Sistem ranking 7 level dengan threshold EXP yang adaptif"],
                  ["Coin reward", "Kumpulkan coin dan buka item kosmetik avatar"],
                  ["Streak bonus", "Prayer streak dan full quest streak terlacak otomatis"],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-3">
                    <span className="mt-0.5 text-brand">✓</span>
                    <span>
                      <strong>{title}</strong> — {desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-bg-card p-6">
              <p className="mb-1 text-xs uppercase tracking-wide text-text-dim">Contoh Profil</p>
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-2xl font-bold text-brand">
                  D
                </div>
                <div>
                  <p className="font-semibold">Fajr Striver</p>
                  <p className="text-sm text-text-dim">Level 14 • D-Rank</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs text-text-dim">
                    <span>EXP Progress</span>
                    <span>220 / 800</span>
                  </div>
                  <ProgressBar value={27} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-line bg-bg-soft p-3">
                    <p className="text-text-dim">Prayer streak</p>
                    <p className="mt-1 font-semibold">9 hari 🔥</p>
                  </div>
                  <div className="rounded-lg border border-line bg-bg-soft p-3">
                    <p className="text-text-dim">Coin</p>
                    <p className="mt-1 font-semibold">480 🪙</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="container-shell py-20 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Siap Mulai Level Up?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-text-dim">
            Gratis selamanya untuk fitur inti. Tidak perlu kartu kredit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-2xl bg-brand px-10 py-4 text-base font-semibold text-black transition hover:bg-brand-strong"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="rounded-2xl border border-line px-10 py-4 text-base text-text-dim transition hover:border-brand hover:text-text"
            >
              Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-line">
        <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-text-dim">
          <p>© {new Date().getFullYear()} Level Up Deen</p>
          <p>Platform pengembangan diri berbasis gamifikasi Islami</p>
        </div>
      </footer>
    </main>
  );
}
