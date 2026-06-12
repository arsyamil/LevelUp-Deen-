import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";

// GET /api/avatar — fetch shop items + user's inventory + current stats (coins, level)
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const [itemsResult, inventoryResult, statsResult] = await Promise.all([
    admin
      .from("items")
      .select("id, name, item_type, rarity, price_coin, unlock_level, description")
      .eq("is_active", true)
      .order("unlock_level", { ascending: true }),
    admin
      .from("user_inventory")
      .select("item_id, is_equipped")
      .eq("user_id", userId),
    admin
      .from("user_stats")
      .select("coins, level")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (itemsResult.error) {
    return NextResponse.json({ error: itemsResult.error.message }, { status: 500 });
  }

  const ownedMap = new Map(
    (inventoryResult.data ?? []).map((row) => [row.item_id, row.is_equipped])
  );

  const items = (itemsResult.data ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    itemType: item.item_type,
    rarity: item.rarity,
    priceCoin: item.price_coin,
    unlockLevel: item.unlock_level,
    description: item.description ?? "",
    owned: ownedMap.has(item.id),
    equipped: ownedMap.get(item.id) === true,
  }));

  return NextResponse.json({
    items,
    coins: statsResult.data?.coins ?? 0,
    level: statsResult.data?.level ?? 1,
  });
}

// POST /api/avatar — buy an item
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const itemId = String(body.itemId ?? "").trim();
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Fetch item details
  const { data: item, error: itemError } = await admin
    .from("items")
    .select("id, price_coin, unlock_level, is_active")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError || !item) {
    return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
  }
  if (!item.is_active) {
    return NextResponse.json({ error: "Item tidak tersedia" }, { status: 400 });
  }

  // Check if already owned
  const { data: existing } = await admin
    .from("user_inventory")
    .select("id")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Item sudah dimiliki" }, { status: 400 });
  }

  // Check user stats (coins and level)
  const { data: stats, error: statsError } = await admin
    .from("user_stats")
    .select("coins, level")
    .eq("user_id", userId)
    .maybeSingle();

  if (statsError || !stats) {
    return NextResponse.json({ error: "Gagal membaca data user" }, { status: 500 });
  }
  if (stats.level < item.unlock_level) {
    return NextResponse.json(
      { error: `Butuh level ${item.unlock_level} untuk membuka item ini` },
      { status: 400 }
    );
  }
  if (stats.coins < item.price_coin) {
    return NextResponse.json({ error: "Coin tidak cukup" }, { status: 400 });
  }

  // Deduct coins and add to inventory atomically
  const [deductResult, inventoryResult] = await Promise.all([
    admin
      .from("user_stats")
      .update({ coins: stats.coins - item.price_coin, updated_at: new Date().toISOString() })
      .eq("user_id", userId),
    admin
      .from("user_inventory")
      .insert({ user_id: userId, item_id: itemId, is_equipped: false }),
  ]);

  if (deductResult.error) {
    return NextResponse.json({ error: deductResult.error.message }, { status: 500 });
  }
  if (inventoryResult.error) {
    return NextResponse.json({ error: inventoryResult.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, coinsRemaining: stats.coins - item.price_coin });
}

// PATCH /api/avatar — equip or unequip an item
export async function PATCH(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const itemId = String(body.itemId ?? "").trim();
  const equip = Boolean(body.equip);
  if (!itemId) {
    return NextResponse.json({ error: "itemId required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // Verify ownership
  const { data: inventoryRow } = await admin
    .from("user_inventory")
    .select("id, is_equipped")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .maybeSingle();

  if (!inventoryRow) {
    return NextResponse.json({ error: "Item tidak ditemukan di inventory" }, { status: 404 });
  }

  // Fetch item type so we can unequip others of the same type
  const { data: itemData } = await admin
    .from("items")
    .select("item_type")
    .eq("id", itemId)
    .maybeSingle();

  if (equip && itemData?.item_type) {
    // Unequip all other items of the same type first
    const sameTypeItems = await admin
      .from("user_inventory")
      .select("item_id")
      .eq("user_id", userId)
      .eq("is_equipped", true)
      .neq("item_id", itemId);

    if ((sameTypeItems.data ?? []).length > 0) {
      const sameTypeIds = (sameTypeItems.data ?? []).map((r) => r.item_id);
      // Only unequip if same item_type
      const sameTypeCheck = await admin
        .from("items")
        .select("id")
        .eq("item_type", itemData.item_type)
        .in("id", sameTypeIds);
      if ((sameTypeCheck.data ?? []).length > 0) {
        const idsToUnequip = (sameTypeCheck.data ?? []).map((r) => r.id);
        await admin
          .from("user_inventory")
          .update({ is_equipped: false })
          .eq("user_id", userId)
          .in("item_id", idsToUnequip);
      }
    }
  }

  const { error: updateError } = await admin
    .from("user_inventory")
    .update({ is_equipped: equip })
    .eq("user_id", userId)
    .eq("item_id", itemId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, equipped: equip });
}
