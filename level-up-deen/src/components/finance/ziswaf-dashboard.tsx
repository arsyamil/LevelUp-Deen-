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

const NISAB_ZAKAT_MAAL = 85000000; // Asumsi 85 gram emas x Rp 1.000.000

export function ZiswafDashboard() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<ZiswafRecord[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "zakat_maal",
    amount: 0,
    date: todayDate(),
    recipient: "",
    note: "",
    accountId: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRecords, resAccounts] = await Promise.all([
        fetch("/api/finance/ziswaf"),
        fetch("/api/finance/accounts")
      ]);
      const dataRecords = await resRecords.json();
      const dataAccounts = await resAccounts.json();

      if (!resRecords.ok) throw new Error(dataRecords.error);
      if (!resAccounts.ok) throw new Error(dataAccounts.error);

      setRecords(dataRecords.data || []);
      setAccounts(dataAccounts.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAssets = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const nisabPercentage = Math.min((totalAssets / NISAB_ZAKAT_MAAL) * 100, 100);
  const isWajibZakat = totalAssets >= NISAB_ZAKAT_MAAL;

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
        ...form,
        type: "zakat_maal",
        amount: 0,
        recipient: "",
        note: "",
      });
      loadData();
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

      <div className="mt-6 p-4 rounded-xl border border-line bg-bg-soft">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Indikator Nisab Zakat Maal</span>
          <span className="text-xs font-medium px-2 py-1 bg-brand/10 text-brand rounded-full">
            Nisab: {formatRupiah(NISAB_ZAKAT_MAAL)}
          </span>
        </div>
        <div className="h-2 bg-line rounded-full overflow-hidden mt-3">
          <div 
            className={`h-full transition-all ${isWajibZakat ? 'bg-danger' : 'bg-brand'}`} 
            style={{ width: `${nisabPercentage}%` }}
          />
        </div>
        <p className="text-xs text-text-dim mt-2">
          Total Aset Anda: <span className="font-semibold text-text">{formatRupiah(totalAssets)}</span>.
          {isWajibZakat ? " Anda telah mencapai batas Nisab, wajib menunaikan Zakat Maal (2.5%)." : " Anda belum mencapai batas Nisab Zakat Maal."}
        </p>
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
              <span className="font-medium">Penerima (Opsional)</span>
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
          <label className="block text-sm">
            <span className="font-medium">Potong Saldo Akun (Opsional)</span>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
            >
              <option value="">-- Jangan potong saldo --</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} ({formatRupiah(acc.balance)})</option>
              ))}
            </select>
            <p className="text-xs text-text-dim mt-1">Jika dipilih, pembayaran ini akan dicatat juga sebagai pengeluaran di buku kas Anda.</p>
          </label>
          <button
            type="submit"
            disabled={saving || form.amount <= 0}
            className="w-full rounded-2xl bg-success px-5 py-3 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pembayaran"}
          </button>
        </form>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-sm mb-4">Riwayat Pembayaran</h3>
        {loading ? (
          <p className="text-sm text-text-dim">Memuat data...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-text-dim text-center py-4 bg-bg-soft rounded-lg">Belum ada riwayat ZISWAF.</p>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <div key={record.id} className="flex justify-between items-center p-3 border border-line rounded-xl bg-bg">
                <div>
                  <p className="text-sm font-medium capitalize">{record.type.replace('_', ' ')}</p>
                  <p className="text-xs text-text-dim mt-0.5">
                    {new Date(record.date).toLocaleDateString("id-ID")}
                    {record.recipient && ` • Penerima: ${record.recipient}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{formatRupiah(record.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
