import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const joinSchema = z.object({
  inviteCode: z.string().length(6, "Kode undangan harus 6 karakter"),
});

// POST /api/squad/join — join via invite code
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = joinSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { inviteCode } = result.data;

  // Check if user is already in a squad
  const { data: existing } = await admin
    .from("squad_members")
    .select("squad_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Kamu sudah bergabung di squad lain. Keluar dulu sebelum join yang baru." },
      { status: 400 }
    );
  }

  // Verify squad exists by invite code
  const { data: squad } = await admin
    .from("squad_groups")
    .select("id, name")
    .ilike("invite_code", inviteCode)
    .maybeSingle();

  if (!squad) {
    return NextResponse.json(
      { error: "Squad dengan kode tersebut tidak ditemukan" },
      { status: 404 }
    );
  }

  // Add member
  const { error: joinError } = await admin.from("squad_members").insert({
    squad_id: squad.id,
    user_id: userId,
    role: "member",
  });

  if (joinError) {
    // Duplicate key means already a member
    if (joinError.code === "23505") {
      return NextResponse.json(
        { error: "Kamu sudah menjadi anggota squad ini" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: joinError.message }, { status: 500 });
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "squad.join",
    entityType: "squad_group",
    entityId: squad.id,
    metadata: { squadName: squad.name, inviteCode },
  });

  return NextResponse.json({ success: true, squadName: squad.name });
}
