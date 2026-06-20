"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Budget {
  id: string;
  month: number;
  year: number;
  amount: number;
  alertThreshold: number;
  category: string;
}

export function BudgetCard({ categorySummary, selectedMonth }: { categorySummary: { category: string, expense: number }[], selectedMonth: string }) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [year, monthIndex] = selectedMonth.split("-").map(Number);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`/api/finance/budgets?month=${monthIndex - 1}&year=${year}`);
      const json = await res.json();
      setBudgets(json.budgets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.get("category"),
          amount: Number(form.get("amount")),
          month: monthIndex - 1,
          year: year,
          alertThreshold: 0.8,
        }),
      });
      setShowForm(false);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus anggaran ini?")) return;
    try {
      await fetch("/api/finance/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Anggaran Pengeluaran 📉</h2>
        <Button size="sm" variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "+ Tambah"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-xl border border-line bg-bg-soft p-4">
          <label className="block text-sm">
            <span className="font-medium">Kategori</span>
            <select name="category" required className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-brand">
              <option value="Makan dan minum">Makan dan minum</option>
              <option value="Transportasi">Transportasi</option>
              <option value="Pendidikan">Pendidikan</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Belanja">Belanja</option>
              <option value="Ibadah dan sedekah">Ibadah dan sedekah</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Batas Anggaran (Rp)</span>
            <input type="number" name="amount" required placeholder="500000" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-brand" />
          </label>
          <Button type="submit" variant="primary" className="w-full">Simpan Anggaran</Button>
        </form>
      )}

      {budgets.length === 0 && !showForm ? (
        <p className="text-sm text-text-dim text-center py-4">Belum ada anggaran yang diatur bulan ini.</p>
      ) : (
        <div className="space-y-4">
          {budgets.map((b) => {
            const actualExpense = categorySummary.find(c => c.category === b.category)?.expense || 0;
            const pct = Math.min(100, Math.round((actualExpense / b.amount) * 100));
            const isWarning = pct >= (b.alertThreshold * 100);
            const isOver = pct >= 100;

            return (
              <div key={b.id} className="relative overflow-hidden rounded-xl border border-line bg-bg-soft p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{b.category}</h3>
                  <button onClick={() => handleDelete(b.id)} className="text-danger hover:underline text-xs">Hapus</button>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-sm text-text-dim">
                  <span>Terpakai: Rp {actualExpense.toLocaleString("id-ID")}</span>
                  <span>Batas: Rp {b.amount.toLocaleString("id-ID")}</span>
                </div>

                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
                  <div className={`h-full transition-all duration-500 ${isOver ? 'bg-danger' : isWarning ? 'bg-amber-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs font-bold ${isOver ? 'text-danger' : isWarning ? 'text-amber-500' : 'text-brand'}`}>{pct}% Terpakai</span>
                  {isOver && <span className="text-xs text-danger font-semibold">Overbudget!</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
