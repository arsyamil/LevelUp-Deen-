"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  status: string;
}

export function SavingsGoalsCard() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/finance/savings");
      const json = await res.json();
      setGoals(json.savings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/finance/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          targetAmount: Number(form.get("targetAmount")),
          targetDate: form.get("targetDate") || undefined,
        }),
      });
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCurrent = async (id: string, current: number, add: number) => {
    try {
      await fetch("/api/finance/savings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          currentAmount: current + add,
        }),
      });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus target tabungan ini?")) return;
    try {
      await fetch("/api/finance/savings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Target Tabungan 🎯</h2>
        <Button size="sm" variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Batal" : "+ Tambah"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-xl border border-line bg-bg-soft p-4">
          <label className="block text-sm">
            <span className="font-medium">Nama Target</span>
            <input type="text" name="name" required placeholder="Contoh: Beli Laptop Baru" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-brand" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="font-medium">Target Nominal (Rp)</span>
              <input type="number" name="targetAmount" required placeholder="10000000" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-brand" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Target Tanggal (Opsional)</span>
              <input type="date" name="targetDate" className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 outline-none focus:border-brand" />
            </label>
          </div>
          <Button type="submit" variant="primary" className="w-full">Simpan Target</Button>
        </form>
      )}

      {goals.length === 0 && !showForm ? (
        <p className="text-sm text-text-dim text-center py-4">Belum ada target tabungan. Yuk mulai menabung!</p>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
            return (
              <div key={g.id} className="relative overflow-hidden rounded-xl border border-line bg-bg-soft p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{g.name}</h3>
                  <button onClick={() => handleDelete(g.id)} className="text-danger hover:underline text-xs">Hapus</button>
                </div>
                
                <div className="mt-2 flex items-center justify-between text-sm text-text-dim">
                  <span>Terkumpul: Rp {g.current_amount.toLocaleString("id-ID")}</span>
                  <span>Target: Rp {g.target_amount.toLocaleString("id-ID")}</span>
                </div>

                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-success transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-right text-xs font-bold text-success">{pct}%</div>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleUpdateCurrent(g.id, Number(g.current_amount), 100000)}>
                    + 100K
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => handleUpdateCurrent(g.id, Number(g.current_amount), 500000)}>
                    + 500K
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
