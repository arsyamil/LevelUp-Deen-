"use client";

export default function AppSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="surface-card p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-danger">Section Error</p>
      <h1 className="mt-2 text-xl font-semibold">Modul gagal dimuat</h1>
      <p className="mt-2 text-sm text-text-dim">
        Terjadi kesalahan pada modul ini. Klik tombol di bawah untuk mencoba ulang.
      </p>
      <p className="mt-4 rounded-lg border border-line bg-bg-soft p-3 font-mono text-xs text-text-dim">
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-strong"
      >
        Reload Modul
      </button>
    </div>
  );
}
