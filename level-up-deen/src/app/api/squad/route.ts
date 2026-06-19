import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const createSquadSchema = z.object({
  name: z.string().min(3, "Nama squad minimal 3 karakter").max(120),
  isPrivate: z.boolean().default(false),
});

// GET /api/squad — list public squads the user can join + squad details if already in one
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  // Check if user is already in a squad
  const { data: membership } = await admin
    .from("squad_members")
    .select("squad_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  let mySquad: {
    id: string;
    name: string;
    isPrivate: boolean;
    inviteCode?: string;
    myRole: string;
    memberCount: number;
    members: Array<{ userId: string; username: string; role: string; joinedAt: string }>;
  } | null = null;

  if (membership) {
    // Fetch squad info + all members
    const [squadResult, membersResult] = await Promise.all([
      admin
        .from("squad_groups")
        .select("id, name, is_private, invite_code")
        .eq("id", membership.squad_id)
        .maybeSingle(),
      admin
        .from("squad_members")
        .select("user_id, role, joined_at")
        .eq("squad_id", membership.squad_id)
        .order("joined_at", { ascending: true }),
    ]);

    if (squadResult.data) {
      const memberUserIds = (membersResult.data ?? []).map((m) => m.user_id);
      const { data: profiles } = memberUserIds.length
        ? await admin
            .from("users_profile")
            .select("id, username")
            .in("id", memberUserIds)
        : { data: [] };

      const usernameMap = new Map(
        (profiles ?? []).map((p) => [p.id, p.username])
      );

      mySquad = {
        id: squadResult.data.id,
        name: squadResult.data.name,
        isPrivate: squadResult.data.is_private,
        inviteCode: squadResult.data.invite_code,
        myRole: membership.role,
        memberCount: (membersResult.data ?? []).length,
        members: (membersResult.data ?? []).map((m) => ({
          userId: m.user_id,
          username: usernameMap.get(m.user_id) ?? "Pengguna",
          role: m.role,
          joinedAt: m.joined_at,
        })),
      };
    }
  }

  // Fetch public squads for the browse list (exclude user's current squad)
  const publicSquadsQuery = admin
    .from("squad_groups")
    .select("id, name, created_at, invite_code")
    .eq("is_private", false)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: publicSquads } = await publicSquadsQuery;

  // Get member counts for public squads
  const publicSquadIds = (publicSquads ?? []).map((s) => s.id);
  let memberCounts = new Map<string, number>();

  if (publicSquadIds.length > 0) {
    const { data: countData } = await admin
      .from("squad_members")
      .select("squad_id")
      .in("squad_id", publicSquadIds);

    const counts = new Map<string, number>();
    for (const row of countData ?? []) {
      counts.set(row.squad_id, (counts.get(row.squad_id) ?? 0) + 1);
    }
    memberCounts = counts;
  }

  const availableSquads = (publicSquads ?? [])
    .filter((s) => s.id !== mySquad?.id)
    .map((s) => ({
      id: s.id,
      name: s.name,
      inviteCode: s.invite_code,
      memberCount: memberCounts.get(s.id) ?? 0,
    }));

  return NextResponse.json({ mySquad, availableSquads });
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(randomInt(chars.length));
  }
  return result;
}

// POST /api/squad — create a new squad
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = createSquadSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  // Check if user is already in a squad
  const { data: existing } = await admin
    .from("squad_members")
    .select("squad_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Kamu sudah bergabung di squad lain. Keluar dulu sebelum membuat yang baru." },
      { status: 400 }
    );
  }

  // Generate unique invite code
  let inviteCode = generateInviteCode();
  let isUnique = false;
  while (!isUnique) {
    const { data: existingGroup } = await admin
      .from("squad_groups")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();
    if (!existingGroup) {
      isUnique = true;
    } else {
      inviteCode = generateInviteCode();
    }
  }

  // Create squad
  const { data: squad, error: createError } = await admin
    .from("squad_groups")
    .insert({
      name: result.data.name,
      created_by: userId,
      is_private: result.data.isPrivate,
      invite_code: inviteCode,
    })
    .select("id, name, is_private, invite_code")
    .maybeSingle();

  if (createError || !squad) {
    return NextResponse.json(
      { error: createError?.message ?? "Gagal membuat squad" },
      { status: 500 }
    );
  }

  // Add creator as admin member
  const { error: memberError } = await admin.from("squad_members").insert({
    squad_id: squad.id,
    user_id: userId,
    role: "admin",
  });

  if (memberError) {
    // Rollback: delete squad
    await admin.from("squad_groups").delete().eq("id", squad.id);
    return NextResponse.json(
      { error: memberError.message },
      { status: 500 }
    );
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "squad.create",
    entityType: "squad_group",
    entityId: squad.id,
    metadata: { name: squad.name, isPrivate: squad.is_private },
  });

  return NextResponse.json({ success: true, squad });
}

// DELETE /api/squad — leave current squad
export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  // Find current membership
  const { data: membership } = await admin
    .from("squad_members")
    .select("squad_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { error: "Kamu tidak bergabung di squad manapun" },
      { status: 400 }
    );
  }

  const squadId = membership.squad_id;

  // Remove member
  await admin
    .from("squad_members")
    .delete()
    .eq("user_id", userId)
    .eq("squad_id", squadId);

  // If the user was admin and the squad is now empty, delete the squad
  const { data: remainingMembers } = await admin
    .from("squad_members")
    .select("user_id")
    .eq("squad_id", squadId);

  if ((remainingMembers ?? []).length === 0) {
    await admin.from("squad_groups").delete().eq("id", squadId);
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "squad.leave",
    entityType: "squad_group",
    entityId: squadId,
  });

  return NextResponse.json({ success: true });
}
