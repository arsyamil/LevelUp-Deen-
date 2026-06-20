import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// GET /api/avatar/equipped — Get user's currently equipped items
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: equipped, error } = await admin
    .from("user_inventory")
    .select(`
      id,
      is_equipped,
      item:items (
        id,
        name,
        item_type,
        rarity,
        image_url,
        model_url,
        gender_restriction
      )
    `)
    .eq("user_id", userId)
    .eq("is_equipped", true);

  if (error) {
    return NextResponse.json({ error: "Gagal memuat data equipped" }, { status: 500 });
  }

  return NextResponse.json({ equipped: equipped ?? [] });
}
