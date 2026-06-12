import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeSystemAuditLog } from "@/lib/audit";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types";

const userTypeSchema = z.enum(["mahasiswa", "pekerja", "santri", "freelancer", "lainnya"]);

const profileSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  fullName: z.string().min(1).max(120),
  timezone: z.string().min(1).max(50),
  userType: userTypeSchema,
});

const reminderPrefsSchema = z.object({
  reminderPrefs: z.object({
    subuhReminderEnabled: z.boolean(),
    waterReminderIntervalMin: z.number().int().min(15).max(480),
    dailyReflectionTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Format jam tidak valid (HH:MM)"),
  }),
});

export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Route to reminder prefs update if body has reminderPrefs key
  if ("reminderPrefs" in body) {
    const result = reminderPrefsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Preferensi reminder tidak valid", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { reminderPrefs } = result.data;

    // Reminder prefs are persisted via system_audit_logs until a dedicated
    // JSONB column is added to users_profile in a future migration.
    await writeSystemAuditLog({
      actorUserId: userId,
      action: "settings.reminders.update",
      entityType: "users_profile",
      entityId: userId,
      metadata: { reminderPrefs },
    });

    return NextResponse.json({ success: true, reminderPrefs });
  }

  // Profile update path
  const result = profileSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Payload profil tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const payload = result.data;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("users_profile")
    .update({
      username: payload.username,
      full_name: payload.fullName,
      timezone: payload.timezone,
      user_type: payload.userType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("id, username, full_name, timezone, user_type, onboarding_completed")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
  }

  const profile: UserProfile = {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    timezone: data.timezone,
    userType: data.user_type as UserProfile["userType"],
    onboardingCompleted: data.onboarding_completed,
  };

  await writeSystemAuditLog({
    actorUserId: userId,
    action: "settings.profile.update",
    entityType: "users_profile",
    entityId: userId,
    metadata: {
      username: profile.username,
      timezone: profile.timezone,
      userType: profile.userType,
    },
  });

  return NextResponse.json({ profile });
}
