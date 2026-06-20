import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";

const features = [
  {
    label: "Deen",
    title: "Ibadah harian terukur",
    desc: "Checklist shalat, dzikir, tilawah, dan streak harian dalam alur quest yang ringan.",
  },
  {
    label: "Body",
    title: "Target fisik adaptif",
    desc: "Push up, squat, lari, dan hidrasi disesuaikan dengan baseline personalmu.",
  },
  {
    label: "Wealth",
    title: "Finansial lebih sadar",
    desc: "Catat transaksi, pantau budget, dan rencanakan tabungan tanpa spreadsheet rumit.",
  },
  {
    label: "AI",
    title: "Coach untuk konsistensi",
    desc: "Pendamping refleksi dan motivasi personal, dengan guardrail agar tetap aman dan relevan.",
  },
  {
    label: "Rank",
    title: "Progress terasa hidup",
    desc: "EXP, level, coin, rank E sampai S+, avatar, dan achievement menjaga momentum.",
  },
  {
    label: "Squad",
    title: "Tumbuh bersama",
    desc: "Retensi sosial ringan lewat squad publik atau privat untuk saling menjaga semangat.",
  },
];

const pillars = [
  { label: "Deen", pct: 78 },
  { label: "Body", pct: 62 },
  { label: "Mind", pct: 45 },
  { label: "Wealth", pct: 70 },
];

const steps = [
  { n: "01", title: "Onboarding", desc: "Isi profil, prioritas, dan baseline dalam beberapa menit." },
  { n: "02", title: "Quest harian", desc: "Sistem menyiapkan target ibadah, body, dan wealth yang personal." },
  { n: "03", title: "Track aksi kecil", desc: "Centang quest, tambah air minum, dan catat transaksi dari satu shell." },
  { n: "04", title: "Naik level", desc: "EXP, streak, rank, dan insight membuat konsistensi terasa nyata." },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="container-shell flex h-16 items-center justify-between">
          <Link href="/" className="cosmic-gradient-text font-semibold uppercase tracking-[0.14em]">
            Level Up Deen
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="cosmic-button-link cosmic-button-secondary px-4 py-2 text-xs">
              Masuk
            </Link>
            <Link href="/register" className="cosmic-button-link cosmic-button-primary px-4 py-2 text-xs">
              Mulai
            </Link>
          </nav>
        </div>
      </header>

      <section className="cosmic-section min-h-[calc(100vh-4rem)]">
        <div className="cosmic-orb left-1/2 top-16 -translate-x-1/2 animate-pulse" />
        <div className="cosmic-orb -left-48 top-64 opacity-40 animate-pulse delay-75" />
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-brand-strong to-transparent opacity-50" />
        <div className="container-shell relative z-10 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="cosmic-badge mb-8">Platform Pengembangan Diri Islami</p>
            <div className="cosmic-heading-glow">
              <h1 className="cosmic-gradient-text text-4xl font-semibold uppercase leading-tight tracking-[0.08em] sm:text-5xl lg:text-6xl">
                Bangun Versi Terbaik Dirimu
              </h1>
            </div>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-dim">
              Level Up Deen menggabungkan ibadah, kesehatan, keuangan, dan AI coach dalam
              satu platform gamifikasi. Konsisten jadi lebih mudah ketika setiap aksi kecil
              terasa seperti progress yang terlihat.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="cosmic-button-link cosmic-button-primary">
                Mulai Gratis
              </Link>
              <Link href="/login" className="cosmic-button-link cosmic-button-secondary">
                Sudah Punya Akun
              </Link>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-text-dim">Live Command Center</p>
                <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.06em]">
                  Dashboard Hari Ini
                </h2>
              </div>
              <span className="rounded-full border border-line-strong bg-brand-soft px-3 py-1 text-xs uppercase tracking-[0.08em] text-brand-strong">
                D-Rank
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Level", "14"],
                ["EXP", "220/800"],
                ["Coin", "480"],
              ].map(([label, value]) => (
                <div key={label} className="rounded border border-line bg-bg p-3">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-text-dim">{label}</p>
                  <p className="mt-2 text-xl text-text">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {pillars.map((pillar) => (
                <div key={pillar.label}>
                  <div className="mb-2 flex justify-between text-xs uppercase tracking-[0.08em]">
                    <span className="text-text">{pillar.label}</span>
                    <span className="text-text-dim">{pillar.pct}%</span>
                  </div>
                  <ProgressBar value={pillar.pct} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cosmic-section">
        <div className="container-shell relative z-10">
          <div className="mb-12 max-w-3xl">
            <p className="cosmic-badge mb-8">Core System</p>
            <div className="cosmic-heading-glow">
              <h2 className="cosmic-gradient-text text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
                Semua Pilar Dalam Satu Orbit
              </h2>
            </div>
            <p className="mt-4 text-base leading-relaxed text-text-dim">
              Dirancang untuk rutinitas harian, bukan hanya tampilan dashboard. Setiap modul
              punya fungsi jelas untuk menjaga ibadah, tubuh, pikiran, dan finansial tetap bergerak.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="surface-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-brand),0.15)]">
                <p className="mb-4 text-xs uppercase tracking-[0.12em] text-brand-strong">
                  {feature.label}
                </p>
                <h3 className="text-xl font-semibold uppercase tracking-[0.06em]">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-dim">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cosmic-section">
        <div className="container-shell relative z-10">
          <div className="mb-12 text-center">
            <p className="cosmic-badge mb-8">Daily Loop</p>
            <div className="cosmic-heading-glow">
              <h2 className="cosmic-gradient-text text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
                Cara Kerjanya
              </h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article key={step.n} className="surface-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-brand),0.15)]">
                <p className="text-3xl text-brand-strong">{step.n}</p>
                <h3 className="mt-5 text-lg font-semibold uppercase tracking-[0.06em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-dim">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cosmic-section">
        <div className="cosmic-orb right-0 top-10 opacity-60" />
        <div className="container-shell relative z-10 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="cosmic-badge mb-8">EXP Engine</p>
            <div className="cosmic-heading-glow">
              <h2 className="cosmic-gradient-text text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
                Setiap Kebiasaan Kecil Memberi EXP
              </h2>
            </div>
            <p className="mt-5 leading-relaxed text-text-dim">
              Shalat Subuh, minum air, olahraga, atau mencatat pengeluaran hari ini semuanya
              masuk ke sistem progres. Aksi kecil menjadi sinyal pertumbuhan yang bisa dilihat.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Rank E - S+", "Threshold EXP adaptif untuk menjaga tantangan tetap masuk akal."],
              ["Coin Reward", "Kumpulkan coin untuk membuka item kosmetik avatar."],
              ["Streak Bonus", "Prayer streak dan quest streak terlacak otomatis."],
            ].map(([title, desc]) => (
              <article key={title} className="surface-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(var(--color-brand),0.15)]">
                <h3 className="text-base font-semibold uppercase tracking-[0.06em]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-dim">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cosmic-section text-center">
        <div className="container-shell relative z-10">
          <p className="cosmic-badge mb-8">Ready</p>
          <div className="cosmic-heading-glow">
            <h2 className="cosmic-gradient-text text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
              Siap Mulai Level Up?
            </h2>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-text-dim">
            Fitur inti gratis untuk membangun ritme harian yang lebih sadar, terukur, dan konsisten.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register" className="cosmic-button-link cosmic-button-primary">
              Daftar Sekarang
            </Link>
            <Link href="/login" className="cosmic-button-link cosmic-button-secondary">
              Masuk
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-bg">
        <div className="container-shell flex flex-wrap items-center justify-between gap-3 py-6 text-xs uppercase tracking-[0.08em] text-text-dim">
          <p>© {new Date().getFullYear()} Level Up Deen</p>
          <p>Platform pengembangan diri berbasis gamifikasi Islami</p>
        </div>
      </footer>
    </main>
  );
}
