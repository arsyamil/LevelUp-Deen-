import { Card } from "@/components/ui/card";
import { getCurrentUserDailyTasks, getCurrentUserDashboardData } from "@/lib/user";
import { DeenTaskList } from "@/components/deen/deen-task-list";

export default async function DeenPage() {
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
        <h1 className="text-2xl font-semibold">Deen Tracker</h1>
        <p className="mt-2 text-sm text-text-dim">
          Shalat 5 waktu adalah system-required quest dan tidak dapat dihapus.
        </p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <h2 className="section-title">Prayer Checklist</h2>
          <DeenTaskList initialTasks={deenTasks} />
        </Card>

        <Card className="p-5 h-fit">
          <h2 className="section-title">Spiritual Progress</h2>
          <p className="mt-3 text-sm text-text-dim">
            Shalat wajib hari ini: {completedMandatory}/{mandatoryTasks.length || 5}
          </p>
          <p className="mt-1 text-sm text-text-dim">
            Prayer streak: {stats?.prayerStreak ?? 0} hari
          </p>
          <p className="mt-1 text-sm text-text-dim">
            Full quest streak: {stats?.fullQuestStreak ?? 0} hari
          </p>
          <p className="mt-1 text-sm text-text-dim">
            Sunnah/deen task aktif: {sunnahTasks.length}
          </p>
          <div className="mt-4 rounded-lg border border-line bg-bg-soft p-3 text-xs text-text-dim">
            Catatan etika: poin dalam aplikasi adalah motivasi habit, bukan ukuran nilai ibadah di sisi Allah.
          </div>
        </Card>
      </div>
    </div>
  );
}
