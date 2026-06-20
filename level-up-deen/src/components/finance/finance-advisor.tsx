"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

export function FinanceAdvisor() {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/finance-advisor");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdvice(data.advice);
    } catch (err: any) {
      setError(err.message || "Gagal mendapatkan saran AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5 border-brand/20 bg-brand/5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand/20 text-brand rounded-lg text-xl">
            ✨
          </div>
          <div>
            <h2 className="font-semibold text-lg text-brand">Konsultan AI Keuangan</h2>
            <p className="text-sm text-text-dim mt-1">Dapatkan evaluasi dan saran finansial Islami dari AI berdasarkan data Anda.</p>
          </div>
        </div>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="shrink-0 px-4 py-2 bg-brand text-text font-medium text-sm rounded-xl hover:bg-brand-strong transition disabled:opacity-50"
        >
          {loading ? "Menganalisis..." : "Minta Saran AI"}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-danger/10 text-danger text-sm rounded-lg">
          {error}
        </div>
      )}

      {advice && (
        <div className="mt-5 p-4 bg-bg-soft border border-line rounded-xl text-sm leading-relaxed whitespace-pre-wrap">
          {advice}
        </div>
      )}
    </Card>
  );
}
