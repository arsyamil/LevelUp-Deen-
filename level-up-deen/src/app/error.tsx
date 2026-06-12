"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-bg text-text">
        <main className="container-shell flex min-h-screen items-center justify-center py-10">
          <div className="surface-card max-w-2xl p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-danger">Global Error</p>
            <h1 className="mt-2 text-2xl font-semibold">Terjadi kesalahan aplikasi</h1>
            <p className="mt-3 text-sm text-text-dim">
              Sistem mengalami kendala tak terduga. Kamu bisa retry atau kembali ke dashboard.
            </p>
            <p className="mt-4 rounded-lg border border-line bg-bg-soft p-3 font-mono text-xs text-text-dim">
              {error.message}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-strong"
              >
                Coba lagi
              </button>
              <Link
                href="/dashboard"
                className="rounded-xl border border-line bg-bg-soft px-4 py-2 text-sm font-semibold"
              >
                Buka Dashboard
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
