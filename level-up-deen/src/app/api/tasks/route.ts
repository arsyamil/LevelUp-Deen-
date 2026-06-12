import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";

type TaskCategory = "deen" | "fitness" | "mind" | "water" | "finance";
type TaskType = "mandatory" | "recommended" | "custom" | "bonus";

const validCategories: TaskCategory[] = ["deen", "fitness", "mind", "water", "finance"];
const validTypes: TaskType[] = ["mandatory", "recommended", "custom", "bonus"];

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  return Number(value);
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  const [tasksResult, logsResult] = await Promise.all([
    admin
      .from("user_tasks")
      .select(
        "id, name, category, task_type, target_value, target_unit, exp_reward, coin_reward, is_active"
      )
      .eq("user_id", userId)
      .eq("is_active", true),
    admin
      .from("daily_task_logs")
      .select("task_id, status")
      .eq("user_id", userId)
      .eq("log_date", today),
  ]);

  if (tasksResult.error || logsResult.error) {
    return NextResponse.json(
      { error: tasksResult.error?.message ?? logsResult.error?.message ?? "Unable to load tasks" },
      { status: 500 }
    );
  }

  const statusByTaskId = new Map<string, string>(
    (logsResult.data ?? []).map((log) => [log.task_id, log.status])
  );

  const tasks = (tasksResult.data ?? []).map((task) => ({
    id: task.id,
    name: task.name,
    category: task.category as TaskCategory,
    taskType: task.task_type as TaskType,
    targetValue:
      task.target_value === null || task.target_value === undefined
        ? undefined
        : Number(task.target_value),
    targetUnit: task.target_unit ?? undefined,
    expReward: Number(task.exp_reward ?? 0),
    coinReward: Number(task.coin_reward ?? 0),
    status: (statusByTaskId.get(task.id) as string) ?? "pending",
  }));

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const name = String(payload.name ?? "").trim();
  const category = String(payload.category ?? "").trim() as TaskCategory;
  const taskType = String(payload.taskType ?? "").trim() as TaskType;
  const targetValue = normalizeNumber(payload.targetValue);
  const targetUnit = String(payload.targetUnit ?? "").trim();
  const expReward = normalizeNumber(payload.expReward) ?? 0;
  const coinReward = normalizeNumber(payload.coinReward) ?? 0;

  if (!name) {
    return NextResponse.json({ error: "Nama tugas wajib diisi" }, { status: 400 });
  }
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Kategori tugas tidak valid" }, { status: 400 });
  }
  if (!validTypes.includes(taskType)) {
    return NextResponse.json({ error: "Tipe tugas tidak valid" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("user_tasks")
    .insert([
      {
        user_id: userId,
        name,
        category,
        task_type: taskType,
        target_value: targetValue,
        target_unit: targetUnit || null,
        exp_reward: expReward,
        coin_reward: coinReward,
        schedule_type: "daily",
        selected_days: ["daily"],
        is_active: true,
        is_deletable: true,
      },
    ])
    .select("id, name, category, task_type, target_value, target_unit, exp_reward, coin_reward");

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: error?.message ?? "Gagal membuat tugas" }, { status: 500 });
  }

  const task = data[0];
  await writeSystemAuditLog({
    actorUserId: userId,
    action: "task.create",
    entityType: "user_task",
    entityId: String(task.id),
    metadata: {
      name: task.name,
      category: task.category,
      taskType: task.task_type,
      expReward: Number(task.exp_reward ?? 0),
      coinReward: Number(task.coin_reward ?? 0),
    },
  });

  return NextResponse.json({
    task: {
      id: task.id,
      name: task.name,
      category: task.category as TaskCategory,
      taskType: task.task_type as TaskType,
      targetValue:
        task.target_value === null || task.target_value === undefined
          ? undefined
          : Number(task.target_value),
      targetUnit: task.target_unit ?? undefined,
      expReward: Number(task.exp_reward ?? 0),
      coinReward: Number(task.coin_reward ?? 0),
      status: "pending",
    },
  });
}
