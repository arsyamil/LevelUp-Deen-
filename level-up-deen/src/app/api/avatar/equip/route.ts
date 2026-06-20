import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const equipSchema = z.object({
  inventoryId: z.string().uuid("Inventory ID tidak valid"),
  equip: z.boolean(),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = equipSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { inventoryId, equip } = result.data;

  // Verify ownership
  const { data: entry } = await admin
    .from("user_inventory")
    .select("id, user_id, item_id")
    .eq("id", inventoryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!entry) {
    return NextResponse.json({ error: "Item tidak ditemukan di inventory kamu" }, { status: 404 });
  }

  // Update equip status (trigger will handle un-equipping others of same type)
  const { error: updateError } = await admin
    .from("user_inventory")
    .update({ is_equipped: equip })
    .eq("id", inventoryId);

  if (updateError) {
    return NextResponse.json({ error: "Gagal mengubah status equip" }, { status: 500 });
  }

  return NextResponse.json({ success: true, equipped: equip });
}
