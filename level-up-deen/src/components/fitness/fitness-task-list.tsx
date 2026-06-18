"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Toast } from "@/components/ui/toast";
import type { TaskLogStatus } from "@/lib/types";

import { LevelUpModal } from "@/components/gamification/level-up-modal";

export interface FitnessTask {
  id: string;
  name: string;
  targetValue: number | null;
  targetUnit: string | null;
  expReward: number;
  status: TaskLogStatus;
  actualValue: number | null;
}

const statusStyles: Record<TaskLogStatus, string> = {
  completed: "border-success/20 bg-success/10 text-success",
  pending: "border-line bg-bg-soft text-text-dim",
  skipped: "border-danger/20 bg-danger/10 text-danger",
};

export function FitnessTaskList({ initialTasks }: { initialTasks: FitnessTask[] }) {
  const [tasks, setTasks] = useState<FitnessTask[]>(initialTasks);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ isOpen: boolean; newLevel: number }>({ isOpen: false, newLevel: 1 });

  const updateTaskStatus = async (taskId: string, status: TaskLogStatus) => {
    setSavingId(taskId);
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Gagal memperbarui status tugas");
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
      alert(err instanceof Error ? err.message : "Gagal memperbarui status tugas");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {tasks.map((task) => {
        const hasTarget = task.targetValue !== null && task.targetValue > 0;
        const actual = task.actualValue ?? 0;
        const progressValue = hasTarget
          ? Math.min(Math.round((actual / task.targetValue!) * 100), 100)
          : task.status === "completed"
          ? 100
          : 0;

        const isSaving = savingId === task.id;

        return (
          <div key={task.id} className="rounded-lg border border-line bg-bg-soft p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
              
              <div className="flex items-center gap-2">
                <span
                  className={`shrink-0 rounded-md border px-2 py-1 text-xs uppercase ${statusStyles[task.status]}`}
                >
                  {task.status}
                </span>
                <button
                  disabled={isSaving}
                  onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "pending" : "completed")}
                  className="rounded bg-brand px-3 py-1 text-xs font-semibold text-black hover:bg-brand/90 disabled:opacity-50"
                >
                  {task.status === "completed" ? "Batal" : "Selesai"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {toastMessage ? <Toast message={toastMessage} /> : null}

      <LevelUpModal 
        isOpen={levelUpData.isOpen} 
        newLevel={levelUpData.newLevel} 
        onClose={() => setLevelUpData((prev) => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}
