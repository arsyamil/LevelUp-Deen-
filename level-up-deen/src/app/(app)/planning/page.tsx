import { Card } from "@/components/ui/card";
import { PlanningManager } from "@/components/planning/planning-manager";
import { ProgressBar } from "@/components/ui/progress-bar";
import { forecastSavingsDate } from "@/lib/finance-ai";
import { getCurrentPlanningMonthParts, getCurrentUserPlanningData } from "@/lib/planning";
import { cookies } from "next/headers";
import { getServerTranslation } from "@/lib/i18n";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthLabel(month: string) {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(Date.UTC(year, monthIndex - 1, 1)));
}

export default async function PlanningPage() {
  const cookieStore = await cookies();
  const { t } = getServerTranslation(cookieStore.get("app-lang")?.value);

  const planning = await getCurrentUserPlanningData();
  const monthlyNetSaving = planning?.monthlyNetSaving ?? 0;
  const fallbackMonth = getCurrentPlanningMonthParts().monthKey;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("budgetPlanningTitle")}</h1>
        <p className="mt-2 text-sm text-text-dim">
          {t("budgetPlanningDesc1")}
          {planning ? `${t("budgetPlanningDesc2")}${formatMonthLabel(planning.month)}.` : "."}
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="section-title">{t("budgetPerCategory")}</h2>
        <div className="mt-4 space-y-4">
          {planning?.budgets.length ? (
            planning.budgets.map((item) => {
              const ratio = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
              return (
                <div key={item.category}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span>{item.category}</span>
                    <span className="text-right text-text-dim">
                      {formatRupiah(item.spent)} / {formatRupiah(item.budget)}
                    </span>
                  </div>
                  <ProgressBar value={Math.min(ratio, 100)} />
                  <p className="mt-1 text-xs text-text-dim">{ratio}% {t("used")}</p>
                </div>
              );
            })
          ) : (
            <p className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-text-dim">
              {t("noBudgetMonth")}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="section-title">{t("savingsForecast")}</h2>
        <p className="mt-3 text-sm text-text-dim">
          {t("netSavingMonth")}{formatRupiah(monthlyNetSaving)}
        </p>

        <div className="mt-4 space-y-4">
          {planning?.savingsGoals.length ? (
            planning.savingsGoals.map((goal) => {
              const forecast = forecastSavingsDate(goal, monthlyNetSaving);
              const progress =
                goal.targetAmount > 0
                  ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                  : 0;

              return (
                <div key={goal.name} className="rounded-lg border border-line bg-bg-soft p-4">
                  <div className="flex flex-col gap-1 text-sm md:flex-row md:items-center md:justify-between">
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-text-dim">
                      {formatRupiah(goal.currentAmount)} / {formatRupiah(goal.targetAmount)}
                    </p>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={Math.min(progress, 100)} />
                  </div>
                  <p className="mt-3 text-sm text-text-dim">
                    {t("targetDate")}{goal.targetDate || t("notSet")}
                  </p>
                  <p className="mt-1 text-sm text-text-dim">
                    {t("forecastReached")}{forecast.predictedDate ?? t("cannotForecast")}
                  </p>
                  <p className="mt-1 text-sm text-text-dim">{t("riskLevel")}{forecast.risk}</p>
                </div>
              );
            })
          ) : (
            <p className="rounded-lg border border-line bg-bg-soft p-4 text-sm text-text-dim">
              {t("noSavingsGoal")}
            </p>
          )}
        </div>
      </Card>

      <PlanningManager
        budgets={planning?.budgets ?? []}
        savingsGoals={planning?.savingsGoals ?? []}
        month={planning?.month ?? fallbackMonth}
      />
    </div>
  );
}
