"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/components/providers";
import type { FinancialDebt } from "@/lib/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DebtTracker() {
  const { t } = useTranslation();
  const [debts, setDebts] = useState<FinancialDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "payable", // payable (hutang) atau receivable (piutang)
    amount: 0,
    person_name: "",
    due_date: "",
    note: "",
  });

  const loadDebts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/debts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDebts(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/finance/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan hutang");
      }
      setForm({
        type: "payable",
        amount: 0,
        person_name: "",
        due_date: "",
        note: "",
      });
      loadDebts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (id: string) => {
    setError(null);
    try {
      const res = await fetch("/api/finance/debts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "paid" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui");
      }
      loadDebts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const totalHutang = debts.filter(d => d.type === "payable" && d.status === "active").reduce((acc, curr) => acc + curr.remaining_amount, 0);
  const totalPiutang = debts.filter(d => d.type === "receivable" && d.status === "active").reduce((acc, curr) => acc + curr.remaining_amount, 0);

  return (
    <Card className="p-5">
      <h2 className="section-title">Hutang & Piutang</h2>
      <p className="text-sm text-text-dim mt-1">Lacak uang yang Anda pinjam atau pinjamkan ke orang lain.</p>

      {error && <div className="mt-4 p-3 bg-danger/10 text-danger text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mt-5">
        <div className="bg-bg-soft rounded-lg p-3 border border-line">
          <p className="text-xs uppercase tracking-wider text-text-dim">Hutang Saya</p>
          <p className="text-lg font-bold text-danger mt-1">{formatRupiah(totalHutang)}</p>
        </div>
        <div className="bg-bg-soft rounded-lg p-3 border border-line">
          <p className="text-xs uppercase tracking-wider text-text-dim">Piutang Saya (Uang Saya di Orang)</p>
          <p className="text-lg font-bold text-success mt-1">{formatRupiah(totalPiutang)}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <h3 className="font-semibold text-sm mb-4">Catat Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["payable", "receivable"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type }))}
                className={`rounded-2xl border px-3 py-2 text-xs md:text-sm font-semibold ${
                  form.type === type
                    ? "border-brand bg-brand text-text"
                    : "border-line bg-bg text-text"
                }`}
              >
                {type === "payable" ? "Hutang (Pinjam)" : "Piutang (Pinjemin)"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="font-medium">Nama Pihak/Orang</span>
              <input
                type="text"
                required
                value={form.person_name}
                onChange={(e) => setForm({ ...form, person_name: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-brand"
              />
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
          
          <button
            type="submit"
            disabled={saving || form.amount <= 0 || !form.person_name}
            className="w-full rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-text transition hover:bg-brand/90 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Catatan"}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-sm mb-3">Daftar Aktif</h3>
        <div className="space-y-2">
          {debts.filter(d => d.status === "active").length > 0 ? (
            debts.filter(d => d.status === "active").map((debt) => (
              <div key={debt.id} className="flex justify-between items-center bg-bg-soft border border-line p-3 rounded-lg">
                <div>
                  <p className="font-semibold text-sm">{debt.person_name}</p>
                  <p className={`text-xs ${debt.type === 'payable' ? 'text-danger' : 'text-success'}`}>
                    {debt.type === 'payable' ? 'Hutang' : 'Piutang'} • {formatRupiah(debt.remaining_amount)}
                  </p>
                </div>
                <button
                  onClick={() => markAsPaid(debt.id)}
                  className="px-3 py-1 text-xs bg-line/50 hover:bg-line rounded-lg transition"
                >
                  Lunas
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-text-dim text-center py-4">Tidak ada catatan aktif.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
