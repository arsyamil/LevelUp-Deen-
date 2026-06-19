import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const joinSchema = z.object({
  squadId: z.string().uuid("ID Squad tidak valid"),
});

// POST /api/squad/join — join a specific squad
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
  const { squadId } = result.data;

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

  // Verify squad exists
  const { data: squad } = await admin
    .from("squad_groups")
    .select("id, name, is_private")
    .eq("id", squadId)
    .maybeSingle();

  if (!squad) {
    return NextResponse.json(
      { error: "Squad tidak ditemukan" },
      { status: 404 }
    );
  }

  // Add member
  const { error: joinError } = await admin.from("squad_members").insert({
    squad_id: squadId,
    user_id: userId,
    role: "member",
  });

  if (joinError) {
    // Duplicate key means already a member (race condition guard)
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
    entityId: squadId,
    metadata: { squadName: squad.name },
  });

  return NextResponse.json({ success: true, squadName: squad.name });
}
