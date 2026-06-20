import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const purchaseSchema = z.object({
  itemId: z.string().uuid("Item ID tidak valid"),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = purchaseSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Data tidak valid", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { itemId } = result.data;

  // 1. Check item exists and is active
  const { data: item } = await admin
    .from("items")
    .select("id, name, price_coin, unlock_level, is_active, gender_restriction")
    .eq("id", itemId)
    .maybeSingle();

  if (!item || !item.is_active) {
    return NextResponse.json({ error: "Item tidak ditemukan atau tidak tersedia" }, { status: 404 });
  }

  // 2. Check if already owned
  const { data: owned } = await admin
    .from("user_inventory")
    .select("id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (owned) {
    return NextResponse.json({ error: "Kamu sudah memiliki item ini" }, { status: 400 });
  }

  // 3. Check user stats (coins + level)
  const { data: stats } = await admin
    .from("user_stats")
    .select("coins, level")
    .eq("user_id", userId)
    .maybeSingle();

  if (!stats) {
    return NextResponse.json({ error: "Data user tidak ditemukan" }, { status: 404 });
  }

  if (stats.level < item.unlock_level) {
    return NextResponse.json(
      { error: `Level kamu belum cukup. Dibutuhkan level ${item.unlock_level}.` },
      { status: 400 }
    );
  }

  if (stats.coins < item.price_coin) {
    return NextResponse.json(
      { error: `Koin tidak cukup. Dibutuhkan ${item.price_coin} koin, kamu punya ${stats.coins}.` },
      { status: 400 }
    );
  }

  // 4. Deduct coins
  const { error: updateError } = await admin
    .from("user_stats")
    .update({ coins: stats.coins - item.price_coin, updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (updateError) {
    return NextResponse.json({ error: "Gagal mengurangi koin" }, { status: 500 });
  }

  // 5. Add to inventory
  const { error: insertError } = await admin
    .from("user_inventory")
    .insert({ user_id: userId, item_id: itemId });

  if (insertError) {
    // Rollback coins
    await admin
      .from("user_stats")
      .update({ coins: stats.coins, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return NextResponse.json({ error: "Gagal menambahkan item ke inventory" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    item: { id: item.id, name: item.name },
    remainingCoins: stats.coins - item.price_coin,
  });
}
