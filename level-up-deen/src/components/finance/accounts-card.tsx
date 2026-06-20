"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/components/providers";
import type { FinancialAccount } from "@/lib/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AccountsCard() {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch("/api/finance/accounts");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat akun");
        setAccounts(data.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAccounts();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (loading) {
    return <Card className="p-5 animate-pulse h-32 bg-bg-soft" />;
  }

  if (error) {
    return (
      <Card className="p-5 border-danger/30">
        <p className="text-sm text-danger">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Dompet & Rekening</h2>
      </div>
      <div className="mt-2 text-3xl font-bold text-brand-strong">
        {formatRupiah(totalBalance)}
      </div>
      <p className="text-xs uppercase tracking-widest text-text-dim mt-1">Total Aset Tunai</p>
      
      <div className="mt-5 space-y-3">
        {accounts.length > 0 ? (
          accounts.map((acc) => (
            <div key={acc.id} className="flex justify-between items-center bg-bg-soft p-3 rounded-lg border border-line">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  acc.type === 'cash' ? 'bg-green-500/20 text-green-500' :
                  acc.type === 'bank' ? 'bg-blue-500/20 text-blue-500' :
                  acc.type === 'ewallet' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-orange-500/20 text-orange-500'
                }`}>
                  {acc.type.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold">{acc.name}</p>
                  <p className="text-[10px] text-text-dim uppercase tracking-wider">{acc.type}</p>
                </div>
              </div>
              <p className="font-semibold">{formatRupiah(acc.balance)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-dim">Belum ada akun.</p>
        )}
      </div>
    </Card>
  );
}
