import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { squadId } = await request.json();
    if (!squadId) return NextResponse.json({ error: "squadId is required" }, { status: 400 });

    const admin = createSupabaseAdminClient();

    // Check if user is already in a squad
    const { data: existing } = await admin
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Anda sudah tergabung dalam Squad" }, { status: 400 });
    }

    // Join squad
    const { error: insertError } = await admin
      .from("squad_members")
      .insert({ squad_id: squadId, user_id: userId, role: "member" });

    if (insertError) {
      return NextResponse.json({ error: "Gagal bergabung ke Squad" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Join Squad Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Leave squad
export async function DELETE() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    // Check role before leaving
    const { data: member } = await admin
      .from("squad_members")
      .select("squad_id, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!member) {
      return NextResponse.json({ error: "Anda tidak berada dalam Squad" }, { status: 400 });
    }

    if (member.role === "leader") {
      // Check if there are other members
      const { count } = await admin
        .from("squad_members")
        .select("*", { count: "exact", head: true })
        .eq("squad_id", member.squad_id);

      if (count && count > 1) {
        return NextResponse.json({ error: "Leader tidak bisa keluar. Promosikan orang lain atau bubarkan squad jika kosong." }, { status: 400 });
      } else {
        // Last person, delete squad entirely
        await admin.from("squads").delete().eq("id", member.squad_id);
        return NextResponse.json({ success: true, message: "Squad dibubarkan" });
      }
    }

    // Just leave
    await admin.from("squad_members").delete().eq("user_id", userId);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Leave Squad Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
