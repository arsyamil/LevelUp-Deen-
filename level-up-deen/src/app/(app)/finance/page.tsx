import { Card } from "@/components/ui/card";
import { FinanceTracker } from "@/components/finance/finance-tracker";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Finance Tracker</h1>
        <p className="mt-2 text-sm text-text-dim">
          Catat transaksi harian, pantau cashflow bulanan, dan analisis budget per kategori.
        </p>
      </Card>

      <FinanceTracker />
    </div>
  );
}
