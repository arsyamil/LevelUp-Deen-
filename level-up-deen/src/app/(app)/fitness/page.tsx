import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

interface FitnessTask {
  id: string;
  name: string;
  targetValue: number | null;
  targetUnit: string | null;
  expReward: number;
  status: "completed" | "pending" | "skipped";
  actualValue: number | null;
}

const statusStyles = {
  completed: "border-success/20 bg-success/10 text-success",
  pending: "border-line bg-bg-soft text-text-dim",
  skipped: "border-danger/20 bg-danger/10 text-danger",
};

export default async function FitnessPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(routes.login);
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  // Fetch all active fitness tasks for the user
  const { data: tasksData, error: tasksError } = await admin
    .from("user_tasks")
    .select("id, name, target_value, target_unit, exp_reward")
    .eq("user_id", userId)
    .eq("category", "fitness")
    .eq("is_active", true);

  // Fetch today's logs for those tasks
  const taskIds = (tasksData ?? []).map((t) => t.id);
  const { data: logsData } = taskIds.length
    ? await admin
        .from("daily_task_logs")
        .select("task_id, status, actual_value")
        .eq("user_id", userId)
        .eq("log_date", today)
        .in("task_id", taskIds)
    : { data: [] };

  const logByTaskId = new Map(
    (logsData ?? []).map((l) => [
      l.task_id,
      { status: l.status as FitnessTask["status"], actualValue: l.actual_value },
    ])
  );

  const fitnessTasks: FitnessTask[] = (tasksData ?? []).map((task) => {
    const log = logByTaskId.get(task.id);
    return {
      id: task.id,
      name: task.name,
      targetValue: task.target_value !== null ? Number(task.target_value) : null,
      targetUnit: task.target_unit ?? null,
      expReward: Number(task.exp_reward ?? 0),
      status: log?.status ?? "pending",
      actualValue: log?.actualValue !== undefined ? Number(log.actualValue) : null,
    };
  });

  const completedCount = fitnessTasks.filter((t) => t.status === "completed").length;
  const totalCount = fitnessTasks.length;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Fitness Tracker</h1>
        <p className="mt-2 text-sm text-text-dim">
          Tracking aktivitas fisik harian berdasarkan target personal dari onboarding.
        </p>
      </Card>

      {tasksError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Gagal memuat data: {tasksError.message}
        </div>
      )}

      {fitnessTasks.length === 0 ? (
        <Card className="p-5">
          <h2 className="section-title">Belum Ada Tugas Fitness</h2>
          <p className="mt-3 text-sm text-text-dim">
            Tugas fitness otomatis dibuat saat onboarding selesai. Jika belum ada,
            kamu bisa menambahkan custom task di halaman{" "}
            <a href={routes.quests} className="text-brand hover:underline">
              Daily Quest
            </a>
            .
          </p>
        </Card>
      ) : (
        <>
          {/* Summary card */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-text-dim">Selesai</p>
              <p className="mt-2 text-2xl font-semibold">
                {completedCount}
                <span className="text-base font-normal text-text-dim">/{totalCount}</span>
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-text-dim">Progress</p>
              <p className="mt-2 text-2xl font-semibold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-text-dim">EXP Tersedia</p>
              <p className="mt-2 text-2xl font-semibold">
                {fitnessTasks
                  .filter((t) => t.status !== "completed")
                  .reduce((s, t) => s + t.expReward, 0)}
              </p>
            </Card>
          </div>

          {/* Task progress list */}
          <Card className="p-5">
            <h2 className="section-title">Progress Hari Ini</h2>
            <div className="mt-4 space-y-4">
              {fitnessTasks.map((task) => {
                const hasTarget = task.targetValue !== null && task.targetValue > 0;
                const actual = task.actualValue ?? 0;
                const progressValue = hasTarget
                  ? Math.min(Math.round((actual / task.targetValue!) * 100), 100)
                  : task.status === "completed"
                  ? 100
                  : 0;

                return (
                  <div key={task.id} className="rounded-lg border border-line bg-bg-soft p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{task.name}</p>
                        <p className="mt-1 text-xs text-text-dim">
                          +{task.expReward} EXP
                          {hasTarget && (
                            <>
                              {" "}
                              • Target:{" "}
                              {task.targetValue?.toLocaleString("id-ID")}{" "}
                              {task.targetUnit ?? ""}
                              {task.actualValue !== null && (
                                <> • Dicapai: {task.actualValue.toLocaleString("id-ID")} {task.targetUnit ?? ""}</>
                              )}
                            </>
                          )}
                        </p>
                        {hasTarget && (
                          <div className="mt-3">
                            <div className="mb-1 flex justify-between text-xs text-text-dim">
                              <span>{actual.toLocaleString("id-ID")} {task.targetUnit ?? ""}</span>
                              <span>{task.targetValue?.toLocaleString("id-ID")} {task.targetUnit ?? ""}</span>
                            </div>
                            <ProgressBar value={progressValue} />
                          </div>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-1 text-xs uppercase ${statusStyles[task.status]}`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 rounded-lg border border-line bg-bg p-3 text-xs text-text-dim">
              Tandai tugas selesai di halaman{" "}
              <a href={routes.quests} className="text-brand hover:underline">
                Daily Quest
              </a>{" "}
              untuk memperbarui status di sini.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
