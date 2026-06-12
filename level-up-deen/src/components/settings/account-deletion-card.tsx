"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/card";

export function AccountDeletionCard() {
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitDeletionRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation, reason }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Gagal mengirim request delete account");
      }

      setReason("");
      setConfirmation("");
      setMessage("Request delete account berhasil dikirim untuk diproses.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim request delete account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-danger/20 p-5">
      <h2 className="section-title">Delete Account Request</h2>
      <p className="mt-3 text-sm text-text-dim">
        Kirim request penghapusan akun untuk diproses. Data tidak langsung dihapus dari aplikasi.
      </p>

      {message ? (
        <p className="mt-3 rounded-lg border border-success/20 bg-success/10 p-3 text-sm text-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 rounded-lg border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={submitDeletionRequest} className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="font-medium">Alasan opsional</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            className="mt-2 min-h-24 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium">Ketik DELETE untuk konfirmasi</span>
          <input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-danger focus:ring-2 focus:ring-danger/20"
          />
        </label>

        <button
          type="submit"
          disabled={submitting || confirmation !== "DELETE"}
          className="rounded-2xl border border-danger/40 bg-danger px-5 py-3 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Mengirim..." : "Kirim Request Delete"}
        </button>
      </form>
    </Card>
  );
}
