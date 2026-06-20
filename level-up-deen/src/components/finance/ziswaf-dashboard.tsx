"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/components/providers";
import type { ZiswafRecord } from "@/lib/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function todayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function ZiswafDashboard() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<ZiswafRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "zakat_maal",
    amount: 0,
    date: todayDate(),
    recipient: "",
    note: "",
  });

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/ziswaf");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/ziswaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan data");
      }
      setForm({
        type: "zakat_maal",
        amount: 0,
        date: todayDate(),
        recipient: "",
        note: "",
      });
      loadRecords();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const totalZakat = records.filter(r => r.type.includes("zakat")).reduce((acc, curr) => acc + curr.amount, 0);
  const totalInfaq = records.filter(r => !r.type.includes("zakat")).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <Card className="p-5">
      <h2 className="section-title">ZISWAF Tracker</h2>
      <p className="text-sm text-text-dim mt-1">Lacak pembayaran Zakat, Infaq, Sadaqah, dan Waqaf.</p>

      {error && <div className="mt-4 p-3 bg-danger/10 text-danger text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="bg-bg-soft rounded-lg p-3 border border-line">
          <p className="text-xs uppercase tracking-wider text-text-dim">Total Zakat</p>
          <p className="text-lg font-bold text-success mt-1">{formatRupiah(totalZakat)}</p>
        </div>
        <div className="bg-bg-soft rounded-lg p-3 border border-line">
          <p className="text-xs uppercase tracking-wider text-text-dim">Infaq/Sadaqah</p>
          <p className="text-lg font-bold text-brand mt-1">{formatRupiah(totalInfaq)}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <h3 className="font-semibold text-sm mb-4">Catat Pembayaran Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium">Jenis</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
              >
                <option value="zakat_maal">Zakat Maal</option>
                <option value="zakat_fitrah">Zakat Fitrah</option>
                <option value="infaq">Infaq</option>
                <option value="sadaqah">Sadaqah</option>
                <option value="waqaf">Waqaf</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Nominal</span>
              <input
                type="number"
                min={1}
                required
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium">Penerima (Lembaga/Orang)</span>
              <input
                type="text"
                value={form.recipient}
                onChange={(e) => setForm({ ...form, recipient: e.target.value })}
                placeholder="Misal: BAZNAS"
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Tanggal</span>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={saving || form.amount <= 0}
            className="w-full rounded-2xl bg-success px-5 py-3 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pembayaran"}
          </button>
        </form>
      </div>
    </Card>
  );
}
