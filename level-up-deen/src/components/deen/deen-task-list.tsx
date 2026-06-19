"use client";

import { useState } from "react";
import type { DailyTask, TaskLogStatus } from "@/lib/types";
import { Toast } from "@/components/ui/toast";
import { useTranslation } from "@/components/providers";

import { LevelUpModal } from "@/components/gamification/level-up-modal";

const statusStyles: Record<TaskLogStatus, string> = {
  completed: "border-success/20 bg-success/10 text-success",
  pending: "border-line bg-bg-soft text-text-dim",
  skipped: "border-danger/20 bg-danger/10 text-danger",
};

export function DeenTaskList({ initialTasks }: { initialTasks: DailyTask[] }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<DailyTask[]>(initialTasks);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number }>({ isOpen: false, newLevel: 1 });

  const updateTaskStatus = async (taskId: string, status: TaskLogStatus) => {
    setSaving(true);
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || t("errUpdateTask"));
      }
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, status } : task))
      );

      if (payload.leveledUp && payload.newLevel) {
        setLevelUpData({ isOpen: true, newLevel: payload.newLevel });
      } else if (payload.expAward || payload.coinAward) {
        const msgParts = [];
        if (payload.expAward) msgParts.push(`+${payload.expAward} EXP`);
        if (payload.coinAward) msgParts.push(`+${payload.coinAward} coin`);
        setToastMessage(msgParts.join(" • "));
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t("errUpdateTask"));
    } finally {
      setSaving(false);
    }
  };

  const mandatoryTasks = tasks.filter((task) => task.taskType === "mandatory");
  const sunnahTasks = tasks.filter((task) => task.taskType !== "mandatory");

  return (
    <>
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
              <div className="flex items-center gap-2">
                <span className={`rounded-md border px-2 py-1 text-xs uppercase ${statusStyles[task.status]}`}>
                  {task.status}
                </span>
                <button
                  disabled={saving}
                  onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                  className="rounded bg-brand px-3 py-1 text-xs font-semibold text-text hover:bg-brand/90 disabled:opacity-50"
                >
                  {task.status === "completed" ? t("cancelBtn") : t("completed")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-lg border border-line bg-bg-soft p-4 text-sm text-text-dim">
          {t("noMandatoryPrayers")}
        </div>
      )}

      {sunnahTasks.length > 0 && (
        <div className="mt-6">
          <h2 className="section-title mb-4">{t("sunnahDeenTasks")}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {sunnahTasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-line bg-bg-soft p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="mt-1 text-xs text-text-dim">
                      {task.taskType} • +{task.expReward} EXP
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-md border px-2 py-1 text-xs uppercase ${statusStyles[task.status]}`}>
                      {task.status}
                    </span>
                    <button
                      disabled={saving}
                      onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                      className="rounded bg-brand px-3 py-1 text-xs font-semibold text-text hover:bg-brand/90 disabled:opacity-50"
                    >
                      {task.status === "completed" ? t("cancelBtn") : t("completed")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {toastMessage ? <Toast message={toastMessage} /> : null}

      <LevelUpModal 
        isOpen={levelUpData.isOpen} 
        newLevel={levelUpData.newLevel} 
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))} 
      />
    </>
  );
}
