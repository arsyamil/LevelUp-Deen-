import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { onboardingSchema } from "@/features/onboarding/schema";
import {
  buildOnboardingSeedTasks,
  generatePersonalizationPlan,
  SeedDailyTask,
} from "@/lib/personalization";
import type { OnboardingAnswers } from "@/lib/types";

function profileUsername(userId: string, email: string, username?: string | null) {
  if (username) {
    return username.slice(0, 50);
  }

  const emailName = email.split("@")[0] || "pengguna";
  const normalizedName = emailName
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${normalizedName || "pengguna"}-${userId.slice(-8)}`.slice(0, 50);
}

async function upsertTaskTemplate(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  task: SeedDailyTask
) {
  const { data, error } = await admin
    .from("task_templates")
    .upsert(
      {
        code: task.code,
        name: task.name,
        category: task.category,
        task_type: task.taskType,
        default_exp: task.expReward,
        default_coin: task.coinReward,
        is_system_required: task.isSystemRequired,
        description: task.description,
      },
      { onConflict: "code" }
    )
    .select("id, code")
    .maybeSingle();

  if (error || !data?.id) {
    throw new Error(error?.message ?? `Gagal menyiapkan template ${task.code}`);
  }

  return String(data.id);
}

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = onboardingSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid onboarding payload", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const answers: OnboardingAnswers = result.data;
  const admin = createSupabaseAdminClient();

  // Get email from Supabase Auth
  let email = "";
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? "";
  } catch {
    // fallback
  }

  const username = profileUsername(userId, email);
  const fullName = email.split("@")[0] || username;

  const { error: profileError } = await admin
    .from("users_profile")
    .upsert(
      {
        id: userId,
        username,
        full_name: fullName,
        timezone: "Asia/Jakarta",
        user_type: answers.userType,
        onboarding_completed: true,
        email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("id")
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { error: statsError } = await admin.from("user_stats").upsert(
    {
      user_id: userId,
      level: 1,
      rank: "E",
      total_exp: 0,
      current_exp: 0,
      next_level_exp: 150,
      coins: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id", ignoreDuplicates: true }
  );

  if (statsError) {
    return NextResponse.json({ error: statsError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from("users_profile")
    .update({
      user_type: answers.userType,
      onboarding_completed: true,
    })
    .eq("id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const plan = generatePersonalizationPlan(answers);

  // Create initial daily tasks for the user based on generated plan
  try {
    const seedTasks = buildOnboardingSeedTasks(plan);
    const templateMap: Record<string, string> = {};

    for (const task of seedTasks) {
      templateMap[task.code] = await upsertTaskTemplate(admin, task);
    }

    const templateIds = Object.values(templateMap);
    const { data: existingTasks, error: existingTasksError } = await admin
      .from("user_tasks")
      .select("template_id")
      .eq("user_id", userId)
      .in("template_id", templateIds);

    if (existingTasksError) {
      throw new Error(existingTasksError.message);
    }

    const existingTemplateIds = new Set(
      (existingTasks ?? []).map((task) => String(task.template_id))
    );

    const inserts = seedTasks
      .filter((task) => !existingTemplateIds.has(templateMap[task.code]))
      .map((task) => ({
        user_id: userId,
        template_id: templateMap[task.code],
        name: task.name,
        category: task.category,
        task_type: task.taskType,
        target_value: task.targetValue ?? null,
        target_unit: task.targetUnit ?? null,
        exp_reward: task.expReward,
        coin_reward: task.coinReward,
        schedule_type: "daily",
        selected_days: ["daily"],
        is_active: true,
        is_deletable: task.isDeletable,
      }));

    if (inserts.length > 0) {
      const { error: insertTasksError } = await admin.from("user_tasks").insert(inserts);
      if (insertTasksError) {
        throw new Error(insertTasksError.message);
      }
    }
  } catch (e) {
    // don't fail onboarding if task creation fails; log for debugging
    // eslint-disable-next-line no-console
    console.error("onboarding: failed to create initial tasks", e);
  }

  return NextResponse.json({ plan, onboardingCompleted: true });
}
