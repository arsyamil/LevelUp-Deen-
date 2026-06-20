import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createSupabaseAdminClient();

    // Find if user is in a squad
    const { data: member } = await admin
      .from("squad_members")
      .select("squad_id, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!member) {
      // User is not in a squad, return available squads
      const { data: squads } = await admin
        .from("squad_groups")
        .select(`
          id, name,
          squad_members (count)
        `)
        .order("created_at", { ascending: false });
        
      return NextResponse.json({ inSquad: false, squads });
    }

    // User is in a squad, return squad details + leaderboard
    const { data: squad } = await admin
      .from("squad_groups")
      .select("*")
      .eq("id", member.squad_id)
      .single();

    // Get members with their stats
    const { data: rawMembers } = await admin
      .from("squad_members")
      .select(`
        user_id, role, joined_at
      `)
      .eq("squad_id", member.squad_id);

    const userIds = rawMembers?.map(m => m.user_id) || [];
    
    // Get profiles and stats for leaderboard
    const { data: profiles } = await admin
      .from("users_profile")
      .select("id, full_name, role")
      .in("id", userIds);
      
    const { data: stats } = await admin
      .from("user_stats")
      .select("user_id, level, coins")
      .in("user_id", userIds);

    const members = rawMembers?.map(m => {
      const p = profiles?.find(p => p.id === m.user_id);
      const s = stats?.find(s => s.user_id === m.user_id);
      return {
        id: m.user_id,
        name: p?.full_name || "Unknown",
        systemRole: p?.role || "user",
        squadRole: m.role,
        joinedAt: m.joined_at,
        level: s?.level || 1,
        coins: s?.coins || 0
      };
    }).sort((a, b) => b.level - a.level || b.coins - a.coins);

    return NextResponse.json({
      inSquad: true,
      squad: {
        ...squad,
        inviteCode: squad.invite_code
      },
      myRole: member.role,
      members
    });

  } catch (error) {
    console.error("GET Squad Error:", error);
    return NextResponse.json({ error: "Gagal memuat data squad" }, { status: 500 });
  }
}

// Create new squad
export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Nama squad wajib diisi" }, { status: 400 });

    const admin = createSupabaseAdminClient();

    // Check if already in squad
    const { data: existing } = await admin
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Anda sudah tergabung dalam Squad lain" }, { status: 400 });
    }

    // Insert new squad
    const { data: squad, error: insertError } = await admin
      .from("squad_groups")
      .insert({ name, is_private: false, created_by: userId })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Nama squad mungkin sudah dipakai" }, { status: 400 });
    }

    // Add creator as leader
    await admin
      .from("squad_members")
      .insert({ squad_id: squad.id, user_id: userId, role: "leader" });

    return NextResponse.json({ squad: { ...squad, inviteCode: squad.invite_code } });

  } catch (error) {
    console.error("POST Squad Error:", error);
    return NextResponse.json({ error: "Gagal membuat squad" }, { status: 500 });
  }
}
