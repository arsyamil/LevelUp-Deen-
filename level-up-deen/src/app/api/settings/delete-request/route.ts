import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { writeSystemAuditLog } from "@/lib/audit";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const deleteRequestSchema = z.object({
  confirmation: z.string(),
  reason: z.string().max(500).optional().default(""),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = deleteRequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload request delete tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  if (result.data.confirmation !== "DELETE") {
    return NextResponse.json(
      { error: "Ketik DELETE untuk mengirim request delete account" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("account_deletion_requests")
    .upsert(
      {
        user_id: userId,
        status: "requested",
        reason: result.data.reason || null,
        requested_at: new Date().toISOString(),
      },
      { onConflict: "user_id,status" }
    )
    .select("id, requested_at")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Gagal mengirim request delete account" },
      { status: 500 }
    );
  }

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "settings.account_deletion.request",
    entityType: "account_deletion_request",
    entityId: String(data.id),
    metadata: {
      requestedAt: data.requested_at,
      hasReason: Boolean(result.data.reason),
    },
  });

  return NextResponse.json({
    request: {
      id: data.id,
      requestedAt: data.requested_at,
      status: "requested",
    },
  });
}
