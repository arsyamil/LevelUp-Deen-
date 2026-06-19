import { Card } from "@/components/ui/card";
import { getCurrentUserDailyTasks, getCurrentUserDashboardData } from "@/lib/user";
import { DeenTaskList } from "@/components/deen/deen-task-list";
import { cookies } from "next/headers";
import { getServerTranslation } from "@/lib/i18n";

export default async function DeenPage() {
  const cookieStore = await cookies();
  const { t } = getServerTranslation(cookieStore.get("app-lang")?.value);

  const [tasks, dashboardData] = await Promise.all([
    getCurrentUserDailyTasks(),
    getCurrentUserDashboardData(),
  ]);

  const deenTasks = tasks.filter((task) => task.category === "deen");
  const mandatoryTasks = deenTasks.filter((task) => task.taskType === "mandatory");
  const sunnahTasks = deenTasks.filter((task) => task.taskType !== "mandatory");
  const completedMandatory = mandatoryTasks.filter((task) => task.status === "completed").length;
  const stats = dashboardData?.stats;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{t("deenTracker")}</h1>
        <p className="mt-2 text-sm text-text-dim">
          {t("deenDesc")}
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h2 className="section-title">{t("prayerChecklist")}</h2>
          <DeenTaskList initialTasks={deenTasks} />
        </Card>

        <Card className="p-5 h-fit">
          <h2 className="section-title">{t("spiritualProgress")}</h2>
          <p className="mt-3 text-sm text-text-dim">
            {t("mandatoryPrayersToday")}: {completedMandatory}/{mandatoryTasks.length || 5}
          </p>
          <p className="mt-1 text-sm text-text-dim">
            {t("prayerStreak")}: {stats?.prayerStreak ?? 0} {t("days")}
          </p>
          <p className="mt-1 text-sm text-text-dim">
            {t("fullQuestStreak")}: {stats?.fullQuestStreak ?? 0} {t("days")}
          </p>
          <p className="mt-1 text-sm text-text-dim">
            {t("activeSunnahTasks")}: {sunnahTasks.length}
          </p>
          <div className="mt-4 rounded-lg border border-line bg-bg-soft p-3 text-xs text-text-dim">
            {t("ethicsNote")}
          </div>
        </Card>
      </div>
    </div>
  );
}
