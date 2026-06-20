import { Card } from "@/components/ui/card";
import { FinanceTracker } from "@/components/finance/finance-tracker";
import { FinanceHealthCheck } from "@/components/finance/finance-health-check";
import { ZiswafDashboard } from "@/components/finance/ziswaf-dashboard";
import { DebtTracker } from "@/components/finance/debt-tracker";
import { FinanceAdvisor } from "@/components/finance/finance-advisor";
import { cookies } from "next/headers";
import { getServerTranslation } from "@/lib/i18n";
import Link from "next/link";

export default async function FinancePage() {
  const cookieStore = await cookies();
  const { t } = getServerTranslation(cookieStore.get("app-lang")?.value);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("financeTrackerTitle")}</h1>
            <p className="mt-2 text-sm text-text-dim">
              {t("financeTrackerDesc")}
            </p>
          </div>
          <Link 
            href="/finance/reports" 
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-text transition hover:bg-brand-strong"
          >
            📊 Lihat Laporan Keuangan
          </Link>
        </div>
      </Card>

      <FinanceAdvisor />

      <FinanceTracker />

      <div className="grid gap-4 md:grid-cols-2">
        <ZiswafDashboard />
        <DebtTracker />
      </div>

      {/* Financial Health Check - Ratio Calculator */}
      <FinanceHealthCheck />
    </div>
  );
}

