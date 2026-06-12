"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export function DataExportCard() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadExport = async () => {
    setExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/settings/export", { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Gagal export data");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const today = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `level-up-deen-export-${today}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="p-5">
      <h2 className="section-title">Export Data</h2>
      <p className="mt-3 text-sm text-text-dim">
        Unduh salinan data akun dalam format JSON untuk arsip pribadi.
      </p>
      {error ? (
        <p className="mt-3 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={downloadExport}
        disabled={exporting}
        className="mt-4 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-black transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {exporting ? "Menyiapkan..." : "Download JSON"}
      </button>
    </Card>
  );
}
