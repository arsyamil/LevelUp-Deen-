import { Card } from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { FitnessTaskList, type FitnessTask } from "@/components/fitness/fitness-task-list";
import { cookies } from "next/headers";
import { getServerTranslation } from "@/lib/i18n";

export default async function FitnessPage() {
  const cookieStore = await cookies();
  const { t } = getServerTranslation(cookieStore.get("app-lang")?.value);
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
        <h1 className="text-2xl font-semibold">{t("fitnessTrackerTitle")}</h1>
        <p className="mt-2 text-sm text-text-dim">
          {t("fitnessTrackerDesc")}
        </p>
      </Card>

      {tasksError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {t("loadDataError")}{tasksError.message}
        </div>
      )}

      {fitnessTasks.length === 0 ? (
        <Card className="p-5">
          <h2 className="section-title">{t("noFitnessTasks")}</h2>
          <p className="mt-3 text-sm text-text-dim">
            {t("noFitnessTasksDesc")}
            <a href={routes.quests} className="text-brand hover:underline">
              {t("dailyQuestLink")}
            </a>
            .
          </p>
        </Card>
      ) : (
        <>
          {/* Summary card */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-text-dim">{t("completed")}</p>
              <p className="mt-2 text-2xl font-semibold">
                {completedCount}
                <span className="text-base font-normal text-text-dim">/{totalCount}</span>
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-text-dim">{t("progress")}</p>
              <p className="mt-2 text-2xl font-semibold">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-wide text-text-dim">{t("expAvailable")}</p>
              <p className="mt-2 text-2xl font-semibold">
                {fitnessTasks
                  .filter((t) => t.status !== "completed")
                  .reduce((s, t) => s + t.expReward, 0)}
              </p>
            </Card>
          </div>

          {/* Task progress list */}
          <Card className="p-5">
            <h2 className="section-title">{t("todayProgress")}</h2>
            <FitnessTaskList initialTasks={fitnessTasks} />
          </Card>
        </>
      )}
    </div>
  );
}
