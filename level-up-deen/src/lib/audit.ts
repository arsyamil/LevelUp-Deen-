import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface SystemAuditLogInput {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeSystemAuditLog({
  actorUserId,
  action,
  entityType,
  entityId,
  metadata = {},
}: SystemAuditLogInput) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("system_audit_logs").insert({
      actor_user_id: actorUserId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata,
    });
  } catch {
    // Audit should not block the user-facing mutation.
  }
}
