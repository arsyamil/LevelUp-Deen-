import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAuthFailure, normalizeRole, requireAdminContext } from "@/lib/auth";
import { roleDefinitions } from "@/lib/rbac";

async function requireAdmin() {
  const context = await requireAdminContext();
  if (isAuthFailure(context)) {
    return {
      response: NextResponse.json({ error: context.error }, { status: context.status }),
      userId: null,
      email: null,
    };
  }

  return {
    response: null,
    userId: context.userId,
    email: context.email,
  };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const admin = createSupabaseAdminClient();

  const { data: profiles, error: profileError } = await admin
    .from("users_profile")
    .select("id, username, full_name, user_type, onboarding_completed, created_at")
    .order("created_at", { ascending: false });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const ids = profiles?.map((profile) => profile.id) ?? [];
  const client = await clerkClient();
  const usersResult = ids.length
    ? await client.users.getUserList({ userId: ids })
    : [];
  const users = Array.isArray(usersResult) ? usersResult : usersResult.data ?? [];

  const roleById = new Map<string, string>();
  const emailById = new Map<string, string>();

  users.forEach((user) => {
    roleById.set(user.id, normalizeRole(user.publicMetadata?.role));
    const primaryEmail = user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? "";
    emailById.set(user.id, primaryEmail);
  });

  const result = profiles?.map((profile) => ({
    id: profile.id,
    username: profile.username,
    fullName: profile.full_name,
    userType: profile.user_type,
    onboardingCompleted: profile.onboarding_completed,
    email: emailById.get(profile.id) ?? "",
    role: roleById.get(profile.id) ?? "user",
    createdAt: profile.created_at,
  })) ?? [];

  const { data: auditLogs, error: logsError } = await admin
    .from("admin_role_change_logs")
    .select(
      "id, changed_by, changed_by_email, changed_user_id, previous_role, new_role, note, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  if (logsError) {
    return NextResponse.json({ error: logsError.message }, { status: 500 });
  }

  return NextResponse.json({ users: result, roles: roleDefinitions, auditLogs });
}

export async function PATCH(request: NextRequest) {
  const { response, userId: adminId, email: adminEmail } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { userId, role } = body as { userId?: string; role?: string };

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  const validRole = roleDefinitions.some((item) => item.key === role);
  if (!validRole) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const client = await clerkClient();
  const targetUser = await client.users.getUser(userId);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existingRole = normalizeRole(targetUser.publicMetadata?.role);
  const updatedMetadata = {
    ...(targetUser.publicMetadata as Record<string, unknown>),
    role,
  };

  await client.users.updateUser(userId, {
    publicMetadata: updatedMetadata,
  });

  const admin = createSupabaseAdminClient();
  const { error: logError } = await admin.from("admin_role_change_logs").insert({
    changed_by: adminId,
    changed_by_email: adminEmail,
    changed_user_id: userId,
    previous_role: existingRole,
    new_role: role,
    note: "Diubah melalui portal admin",
  });

  if (logError) {
    return NextResponse.json({ error: logError.message }, { status: 500 });
  }

  return NextResponse.json({ userId, role });
}
