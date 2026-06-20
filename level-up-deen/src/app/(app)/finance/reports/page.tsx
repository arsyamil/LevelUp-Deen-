import { Card } from "@/components/ui/card";
import { FinanceReports } from "@/components/finance/finance-reports";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FinanceReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/finance" className="p-2 rounded-full hover:bg-bg-soft transition">
          <ArrowLeft className="w-5 h-5 text-text-dim hover:text-text" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Laporan Keuangan</h1>
          <p className="text-sm text-text-dim">
            Pantau arus kas dan evaluasi kesehatan finansial berdasarkan periode.
          </p>
        </div>
      </div>

      <FinanceReports />
    </div>
  );
}
