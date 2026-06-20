import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isAuthFailure, requireAdminContext } from "@/lib/auth";

async function requireAdmin() {
  const context = await requireAdminContext();
  if (isAuthFailure(context)) {
    return {
      response: NextResponse.json({ error: context.error }, { status: context.status }),
      userId: null,
      email: null,
    };
  }

  return {
    response: null,
    userId: context.userId,
    email: context.email,
  };
}

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const admin = createSupabaseAdminClient();

  const { data: items, error } = await admin
    .from("items")
    .select("*")
    .order("unlock_level", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: items ?? [] });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { name, item_type, rarity, price_coin, unlock_level, gender_restriction, description, model_url } = body;

  if (!name || !item_type || !rarity) {
    return NextResponse.json({ error: "Name, item_type, and rarity are required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: item, error } = await admin
    .from("items")
    .insert({
      name,
      item_type,
      rarity,
      price_coin: Number(price_coin) || 0,
      unlock_level: Number(unlock_level) || 1,
      gender_restriction: gender_restriction || "unisex",
      description: description || null,
      model_url: model_url || null,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json();
  const { id, name, item_type, rarity, price_coin, unlock_level, gender_restriction, description, model_url, is_active } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: item, error } = await admin
    .from("items")
    .update({
      name,
      item_type,
      rarity,
      price_coin: price_coin !== undefined ? Number(price_coin) : undefined,
      unlock_level: unlock_level !== undefined ? Number(unlock_level) : undefined,
      gender_restriction,
      description,
      model_url,
      is_active,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
