import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import { getAuthBypassUserId, isAuthBypassEnabled, serverEnv } from "@/lib/env";
import { RoleKey, roleDefinitions } from "@/lib/rbac";

export interface AuthContext {
  userId: string;
  email: string;
  role: RoleKey;
}

export interface AuthFailure {
  error: "Unauthorized" | "Forbidden";
  status: 401 | 403;
}

export async function getCurrentUserId(): Promise<string | null> {
  if (isAuthBypassEnabled()) {
    return getAuthBypassUserId();
  }

  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export function normalizeRole(role: unknown): RoleKey {
  const value = typeof role === "string" ? role : "user";
  return roleDefinitions.some((item) => item.key === value) ? (value as RoleKey) : "user";
}

export function isAdminRole(role: RoleKey) {
  return role === "admin_system";
}

async function getUserRoleFromProfile(userId: string): Promise<RoleKey> {
  try {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("users_profile")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    return normalizeRole(data?.role);
  } catch {
    return "user";
  }
}

async function getUserEmailFromAuth(): Promise<string> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? "";
  } catch {
    return "";
  }
}

export async function getCurrentAuthContext(): Promise<AuthContext | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  if (isAuthBypassEnabled()) {
    return {
      userId,
      email: "demo@levelupdeen.local",
      role: normalizeRole(serverEnv.AUTH_BYPASS_ROLE ?? "admin_system"),
    };
  }

  const [email, role] = await Promise.all([
    getUserEmailFromAuth(),
    getUserRoleFromProfile(userId),
  ]);

  return { userId, email, role };
}

export async function requireAdminContext(): Promise<AuthContext | AuthFailure> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "Unauthorized", status: 401 };
  }

  if (isAuthBypassEnabled()) {
    const role = normalizeRole(serverEnv.AUTH_BYPASS_ROLE ?? "admin_system");
    if (!isAdminRole(role)) {
      return { error: "Forbidden", status: 403 };
    }

    return {
      userId,
      email: "demo@levelupdeen.local",
      role,
    };
  }

  const [email, role] = await Promise.all([
    getUserEmailFromAuth(),
    getUserRoleFromProfile(userId),
  ]);

  if (!isAdminRole(role)) {
    return { error: "Forbidden", status: 403 };
  }

  return { userId, email, role };
}

export function isAuthFailure(value: AuthContext | AuthFailure): value is AuthFailure {
  return "error" in value;
}
