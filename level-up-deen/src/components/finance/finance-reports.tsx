"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

type Period = "daily" | "weekly" | "monthly" | "quarterly";

interface ReportData {
  summary: { income: number; expense: number; net: number };
  categorySummary: Array<{ category: string; income: number; expense: number }>;
  transactions: Array<{ id: string; type: string; amount: number; note: string; transactionDate: string; category: string }>;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getDateRange(period: Period) {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  if (period === "weekly") {
    start.setDate(end.getDate() - 7);
  } else if (period === "monthly") {
    start.setMonth(end.getMonth() - 1);
  } else if (period === "quarterly") {
    start.setMonth(end.getMonth() - 3);
  }

  const format = (d: Date) => {
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().split("T")[0];
  };

  return { start: format(start), end: format(end) };
}

export function FinanceReports() {
  const [period, setPeriod] = useState<Period>("monthly");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange(period);
      const res = await fetch(`/api/finance/reports?start=${start}&end=${end}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["daily", "weekly", "monthly", "quarterly"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              period === p ? "border-brand bg-brand text-text" : "border-line bg-bg text-text-dim hover:border-brand/50"
            }`}
          >
            {p === "daily" ? "Harian" : p === "weekly" ? "Mingguan" : p === "monthly" ? "Bulanan" : "Per 3 Bulan"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-dim text-sm">Memuat data laporan...</p>
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 bg-bg-soft">
              <p className="text-xs uppercase tracking-wide text-text-dim">Pemasukan</p>
              <p className="mt-2 text-xl font-semibold text-success">{formatRupiah(data.summary.income)}</p>
            </Card>
            <Card className="p-4 bg-bg-soft">
              <p className="text-xs uppercase tracking-wide text-text-dim">Pengeluaran</p>
              <p className="mt-2 text-xl font-semibold text-danger">{formatRupiah(data.summary.expense)}</p>
            </Card>
            <Card className="p-4 bg-bg-soft">
              <p className="text-xs uppercase tracking-wide text-text-dim">Arus Kas Bersih (Net)</p>
              <p className={`mt-2 text-xl font-semibold ${data.summary.net >= 0 ? "text-success" : "text-danger"}`}>
                {formatRupiah(data.summary.net)}
              </p>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="section-title mb-4">Pengeluaran per Kategori</h3>
              <div className="h-64 w-full">
                {data.categorySummary.filter(c => c.expense > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categorySummary.filter(c => c.expense > 0)}
                        dataKey="expense"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {data.categorySummary.filter(c => c.expense > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => formatRupiah(Number(val))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-text-dim flex h-full items-center justify-center">Tidak ada pengeluaran</p>
                )}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="section-title mb-4">Pemasukan per Kategori</h3>
              <div className="h-64 w-full">
                {data.categorySummary.filter(c => c.income > 0).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categorySummary.filter(c => c.income > 0)}
                        dataKey="income"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {data.categorySummary.filter(c => c.income > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: any) => formatRupiah(Number(val))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-text-dim flex h-full items-center justify-center">Tidak ada pemasukan</p>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="section-title mb-4">Rincian Transaksi ({data.transactions.length})</h3>
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {data.transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-line bg-bg-soft">
                  <div>
                    <p className="font-medium text-sm">{tx.category}</p>
                    <p className="text-xs text-text-dim">{tx.transactionDate} {tx.note ? `· ${tx.note}` : ""}</p>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </p>
                </div>
              ))}
              {data.transactions.length === 0 && (
                <p className="text-sm text-text-dim text-center py-4">Belum ada transaksi di periode ini.</p>
              )}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
