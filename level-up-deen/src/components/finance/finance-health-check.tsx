"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";

interface RatioResult {
  id: string;
  name: string;
  description: string;
  formula: string;
  value: number | null;
  unit: string;
  healthyMin: number;
  healthyMax: number;
  status: "healthy" | "warning" | "critical";
}

interface RatioData {
  ratios: RatioResult[];
  summary: { income: number; expense: number; savings: number };
  period: { start: string; end: string };
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const statusConfig = {
  healthy: {
    label: "Sehat",
    emoji: "✅",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-400/30",
    bgColor: "bg-emerald-400/10",
  },
  warning: {
    label: "Perhatian",
    emoji: "⚠️",
    barColor: "bg-amber-500",
    textColor: "text-amber-400",
    borderColor: "border-amber-400/30",
    bgColor: "bg-amber-400/10",
  },
  critical: {
    label: "Kritis",
    emoji: "🚨",
    barColor: "bg-red-500",
    textColor: "text-red-400",
    borderColor: "border-red-400/30",
    bgColor: "bg-red-400/10",
  },
};

export function FinanceHealthCheck() {
  const [data, setData] = useState<RatioData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRatios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/ratios");
      const json = await res.json();
      setData(json);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRatios();
  }, [fetchRatios]);

  if (loading) {
    return (
      <Card className="p-5">
        <p className="text-sm text-text-dim">Menghitung rasio keuangan...</p>
      </Card>
    );
  }

  if (!data || data.ratios.length === 0) {
    return (
      <Card className="p-5">
        <h2 className="section-title">💊 Financial Health Check</h2>
        <p className="mt-3 text-sm text-text-dim">
          Belum ada data transaksi bulan ini untuk dihitung. Mulai catat pemasukan dan pengeluaran kamu!
        </p>
      </Card>
    );
  }

  const healthyCount = data.ratios.filter((r) => r.status === "healthy").length;
  const overallScore = Math.round((healthyCount / data.ratios.length) * 100);

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <Card className="p-5">
        <h2 className="section-title">💊 Financial Health Check</h2>
        <p className="mt-1 text-xs text-text-dim">
          Periode: {data.period.start} s/d {data.period.end}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-line bg-bg-soft p-3">
            <p className="text-xs text-text-dim">Pemasukan</p>
            <p className="mt-1 font-semibold text-success">{formatRupiah(data.summary.income)}</p>
          </div>
          <div className="rounded-lg border border-line bg-bg-soft p-3">
            <p className="text-xs text-text-dim">Pengeluaran</p>
            <p className="mt-1 font-semibold">{formatRupiah(data.summary.expense)}</p>
          </div>
          <div className="rounded-lg border border-line bg-bg-soft p-3">
            <p className="text-xs text-text-dim">Tabungan</p>
            <p className={`mt-1 font-semibold ${data.summary.savings >= 0 ? "text-success" : "text-danger"}`}>
              {formatRupiah(data.summary.savings)}
            </p>
          </div>
        </div>

        {/* Overall score */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4">
          <div className="text-3xl font-bold text-brand">{overallScore}%</div>
          <div>
            <p className="text-sm font-semibold">Skor Kesehatan Keuangan</p>
            <p className="text-xs text-text-dim">
              {healthyCount} dari {data.ratios.length} indikator dalam kondisi sehat
            </p>
          </div>
        </div>
      </Card>

      {/* Individual ratios */}
      <AnimatePresence>
        {data.ratios.map((ratio, index) => {
          const config = statusConfig[ratio.status];
          const percentage =
            ratio.value !== null
              ? Math.min(Math.max((ratio.value / Math.max(ratio.healthyMax, 1)) * 100, 0), 100)
              : 0;

          return (
            <motion.div
              key={ratio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className={`border ${config.borderColor} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{config.emoji}</span>
                      <h3 className="font-semibold">{ratio.name}</h3>
                    </div>
                    <p className="mt-1 text-xs text-text-dim">{ratio.description}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${config.textColor}`}>
                      {ratio.value !== null ? ratio.value : "—"}{ratio.unit}
                    </p>
                    <span className={`inline-block mt-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.borderColor} ${config.bgColor} ${config.textColor}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-text-dim mb-1">
                    <span>Min: {ratio.healthyMin}{ratio.unit}</span>
                    <span>Max: {ratio.healthyMax}{ratio.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-bg-soft">
                    <motion.div
                      className={`h-full rounded-full ${config.barColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: index * 0.08 }}
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-text-dim">
                  Formula: <code className="rounded bg-bg-soft px-1 py-0.5">{ratio.formula}</code>
                </p>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
