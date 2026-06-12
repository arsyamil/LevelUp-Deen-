import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="container-shell flex min-h-[70vh] items-center justify-center py-10">
      <div className="surface-card max-w-lg p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-text-dim">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <p className="mt-3 text-sm text-text-dim">
          Route yang kamu cari belum tersedia atau sudah dipindahkan.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-strong"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </main>
  );
}
