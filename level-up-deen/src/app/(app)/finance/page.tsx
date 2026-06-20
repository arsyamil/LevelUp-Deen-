import { Card } from "@/components/ui/card";
import { FinanceTracker } from "@/components/finance/finance-tracker";
import { FinanceHealthCheck } from "@/components/finance/finance-health-check";
import { cookies } from "next/headers";
import { getServerTranslation } from "@/lib/i18n";

export default async function FinancePage() {
  const cookieStore = await cookies();
  const { t } = getServerTranslation(cookieStore.get("app-lang")?.value);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("financeTrackerTitle")}</h1>
        <p className="mt-2 text-sm text-text-dim">
          {t("financeTrackerDesc")}
        </p>
      </Card>

      <FinanceTracker />

      {/* Financial Health Check - Ratio Calculator */}
      <FinanceHealthCheck />
    </div>
  );
}

