"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

function FinanceLoadingCard({ label }: { label: string }) {
  return (
    <Card className="p-5">
      <div className="h-4 w-32 animate-pulse rounded bg-bg-soft" />
      <p className="mt-3 text-sm text-text-dim">{label}</p>
    </Card>
  );
}

const FinanceAdvisor = dynamic(
  () => import("@/components/finance/finance-advisor").then((mod) => mod.FinanceAdvisor),
  {
    ssr: false,
    loading: () => <FinanceLoadingCard label="Memuat konsultan AI..." />,
  }
);

const FinanceTracker = dynamic(
  () => import("@/components/finance/finance-tracker").then((mod) => mod.FinanceTracker),
  {
    ssr: false,
    loading: () => <FinanceLoadingCard label="Memuat catatan transaksi..." />,
  }
);

const ZiswafDashboard = dynamic(
  () => import("@/components/finance/ziswaf-dashboard").then((mod) => mod.ZiswafDashboard),
  {
    ssr: false,
    loading: () => <FinanceLoadingCard label="Memuat ZISWAF..." />,
  }
);

const DebtTracker = dynamic(
  () => import("@/components/finance/debt-tracker").then((mod) => mod.DebtTracker),
  {
    ssr: false,
    loading: () => <FinanceLoadingCard label="Memuat hutang dan piutang..." />,
  }
);

const FinanceHealthCheck = dynamic(
  () => import("@/components/finance/finance-health-check").then((mod) => mod.FinanceHealthCheck),
  {
    ssr: false,
    loading: () => <FinanceLoadingCard label="Memuat rasio kesehatan keuangan..." />,
  }
);

export function FinanceLazySections() {
  return (
    <>
      <FinanceAdvisor />

      <FinanceTracker />

      <div className="grid gap-4 md:grid-cols-2">
        <ZiswafDashboard />
        <DebtTracker />
      </div>

      <FinanceHealthCheck />
    </>
  );
}
