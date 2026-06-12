import { getClerkUserById, getCurrentUserId, normalizeRole } from "@/lib/auth";
import { isAuthBypassEnabled, serverEnv } from "@/lib/env";
import { RoleKey } from "@/lib/rbac";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { formatDateInTimeZone } from "@/lib/date";
import type { DailyTask, UserProfile, UserStats } from "@/lib/types";

export interface AuthenticatedUserProfile extends UserProfile {
  email: string;
  role: RoleKey;
}

export interface UserDashboardData {
  profile: AuthenticatedUserProfile;
  stats: UserStats;
  totalDailyTasks: number;
  completedDailyTasks: number;
}

const defaultUserType: UserProfile["userType"] = "lainnya";

function profileUsername(userId: string, email: string, username?: string | null) {
  if (username) {
    return username.slice(0, 50);
  }

  const emailName = email.split("@")[0] || "pengguna";
  const normalizedName = emailName
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = userId.slice(-8);
  return `${normalizedName || "pengguna"}-${suffix}`.slice(0, 50);
}

function getBypassProfile(userId: string): AuthenticatedUserProfile {
  return {
    id: userId,
    username: "demo_user",
    fullName: "Demo User",
    timezone: "Asia/Jakarta",
    userType: defaultUserType,
    onboardingCompleted: true,
    email: "demo@levelupdeen.local",
    role: normalizeRole(serverEnv.AUTH_BYPASS_ROLE ?? "admin_system"),
  };
}

export async function getCurrentUserProfile(): Promise<AuthenticatedUserProfile | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const bypassEnabled = isAuthBypassEnabled();
  const clerkUser = bypassEnabled ? null : await getClerkUserById(userId);
  if (!bypassEnabled && !clerkUser) {
    return null;
  }

  const email = bypassEnabled
    ? "demo@levelupdeen.local"
    : clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const role = bypassEnabled
    ? normalizeRole(serverEnv.AUTH_BYPASS_ROLE ?? "admin_system")
    : normalizeRole(clerkUser?.publicMetadata?.role);
  const username = bypassEnabled
    ? "demo_user"
    : profileUsername(userId, email, clerkUser?.username);
  const fullName = bypassEnabled
    ? "Demo User"
    : clerkUser?.fullName ?? clerkUser?.firstName ?? username;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("users_profile")
    .select("id, username, full_name, timezone, user_type, onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (bypassEnabled) {
      return getBypassProfile(userId);
    }
    return null;
  }

  let profile = data;
  if (!profile) {
    const insertResult = await admin
      .from("users_profile")
      .upsert({
        id: userId,
        username,
        full_name: fullName,
        timezone: "Asia/Jakarta",
        user_type: defaultUserType,
        onboarding_completed: bypassEnabled,
      }, { onConflict: "id" })
      .select("id, username, full_name, timezone, user_type, onboarding_completed")
      .maybeSingle();

    if (insertResult.error || !insertResult.data) {
      if (bypassEnabled) {
        return getBypassProfile(userId);
      }
      return null;
    }

    profile = insertResult.data;
  }

  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.full_name,
    timezone: profile.timezone,
    userType: profile.user_type as UserProfile["userType"],
    onboardingCompleted: profile.onboarding_completed,
    email,
    role,
  };
}

export async function getCurrentUserDashboardData(
  currentProfile?: AuthenticatedUserProfile
): Promise<UserDashboardData | null> {
  const profile = currentProfile ?? (await getCurrentUserProfile());
  if (!profile) {
    return null;
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const admin = createSupabaseAdminClient();

  const { data: statsData, error: statsError } = await admin
    .from("user_stats")
    .select(
      "level, rank, total_exp, current_exp, next_level_exp, coins, prayer_streak, full_quest_streak"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (statsError) {
    if (isAuthBypassEnabled()) {
      return {
        profile,
        stats: {
          level: 1,
          rank: "E",
          totalExp: 0,
          currentExp: 0,
          nextLevelExp: 150,
          coins: 0,
          prayerStreak: 0,
          fullQuestStreak: 0,
        },
        totalDailyTasks: 0,
        completedDailyTasks: 0,
      };
    }
    return null;
  }

  const stats: UserStats = statsData
    ? {
        level: statsData.level,
        rank: statsData.rank,
        totalExp: statsData.total_exp ?? 0,
        currentExp: statsData.current_exp ?? 0,
        nextLevelExp: statsData.next_level_exp ?? 150,
        coins: statsData.coins ?? 0,
        prayerStreak: statsData.prayer_streak ?? 0,
        fullQuestStreak: statsData.full_quest_streak ?? 0,
      }
    : {
        level: 1,
        rank: "E",
        totalExp: 0,
        currentExp: 0,
        nextLevelExp: 150,
        coins: 0,
        prayerStreak: 0,
        fullQuestStreak: 0,
      };

  const today = formatDateInTimeZone();

  const totalTasksResult = await admin
    .from("user_tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const completedTasksResult = await admin
    .from("daily_task_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("log_date", today)
    .eq("status", "completed");

  const totalDailyTasks = totalTasksResult.count ?? 0;
  const completedDailyTasks = completedTasksResult.count ?? 0;

  return {
    profile,
    stats,
    totalDailyTasks,
    completedDailyTasks,
  };
}

export async function getCurrentUserDailyTasks(): Promise<DailyTask[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const admin = createSupabaseAdminClient();
  const today = formatDateInTimeZone();

  const { data: tasksData, error: tasksError } = await admin
    .from("user_tasks")
    .select(
      "id, name, category, task_type, target_value, target_unit, exp_reward, coin_reward, is_active"
    )
    .eq("user_id", userId)
    .eq("is_active", true);

  if (tasksError || !tasksData) {
    return [];
  }

  const { data: logsData, error: logsError } = await admin
    .from("daily_task_logs")
    .select("task_id, status")
    .eq("user_id", userId)
    .eq("log_date", today);

  if (logsError || !logsData) {
    return [];
  }

  const statusByTaskId = new Map(logsData.map((log) => [log.task_id, log.status]));

  return tasksData.map((task) => ({
    id: task.id,
    name: task.name,
    category: task.category as DailyTask["category"],
    taskType: task.task_type as DailyTask["taskType"],
    targetValue:
      task.target_value === null || task.target_value === undefined
        ? undefined
        : Number(task.target_value),
    targetUnit: task.target_unit ?? undefined,
    expReward: Number(task.exp_reward ?? 0),
    coinReward: Number(task.coin_reward ?? 0),
    status: (statusByTaskId.get(task.id) as DailyTask["status"]) ?? "pending",
  }));
}
