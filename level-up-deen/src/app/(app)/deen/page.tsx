import { Card } from "@/components/ui/card";
import { getCurrentUserDailyTasks, getCurrentUserDashboardData } from "@/lib/user";

const statusStyles = {
  completed: "border-success/20 bg-success/10 text-success",
  pending: "border-line bg-bg-soft text-text-dim",
  skipped: "border-danger/20 bg-danger/10 text-danger",
};

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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="section-title">Prayer Checklist</h2>
          {mandatoryTasks.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {mandatoryTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-bg-soft p-3"
                >
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="mt-1 text-xs text-text-dim">+{task.expReward} EXP</p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs uppercase ${statusStyles[task.status]}`}
                  >
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 rounded-lg border border-line bg-bg-soft p-4 text-sm text-text-dim">
              Belum ada checklist shalat wajib. Selesaikan onboarding untuk membuat task shalat otomatis.
            </div>
          )}
        </Card>

        <Card className="p-5">
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

      {sunnahTasks.length > 0 ? (
        <Card className="p-5">
          <h2 className="section-title">Sunnah & Deen Tasks</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sunnahTasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-line bg-bg-soft p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="mt-1 text-xs text-text-dim">
                      {task.taskType} • +{task.expReward} EXP
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2 py-1 text-xs uppercase ${statusStyles[task.status]}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
