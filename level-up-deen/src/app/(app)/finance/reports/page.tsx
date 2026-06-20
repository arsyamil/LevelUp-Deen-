import { FinanceReports } from "@/components/finance/finance-reports";
import Link from "next/link";

export default function FinanceReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/finance"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg text-text-dim transition hover:bg-bg-soft hover:text-text"
          aria-label="Kembali ke keuangan"
        >
          <span aria-hidden="true">&larr;</span>
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
