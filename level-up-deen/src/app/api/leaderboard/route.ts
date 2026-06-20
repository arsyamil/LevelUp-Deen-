import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "global"; // "global" | "squad"
  
  const admin = createSupabaseAdminClient();

  let userIdsToFetch: string[] | null = null; // null means all users (global)

  if (type === "squad") {
    // 1. Get user's squad
    const { data: mySquad } = await admin
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!mySquad) {
      return NextResponse.json({ data: [] }); // Not in a squad
    }

    // 2. Get all members in that squad
    const { data: members } = await admin
      .from("squad_members")
      .select("user_id")
      .eq("squad_id", mySquad.squad_id);

    if (!members) {
      return NextResponse.json({ data: [] });
    }
    userIdsToFetch = members.map(m => m.user_id);
  }

  // 3. Fetch profiles and stats
  // Note: we'll fetch from users_profile and user_stats
  let profileQuery = admin.from("users_profile").select("id, full_name, username");
  if (userIdsToFetch) {
    profileQuery = profileQuery.in("id", userIdsToFetch);
  }

  const { data: profiles } = await profileQuery;
  
  let statsQuery = admin.from("user_stats").select("user_id, total_exp, current_exp");
  if (userIdsToFetch) {
    statsQuery = statsQuery.in("user_id", userIdsToFetch);
  }

  const { data: stats } = await statsQuery;

  if (!profiles || !stats) {
    return NextResponse.json({ data: [] });
  }

  // 4. Combine and sort
  const leaderboard = profiles.map(profile => {
    const stat = stats.find(s => s.user_id === profile.id);
    const score = stat?.total_exp || 0;
    return {
      userId: profile.id,
      username: profile.full_name || profile.username || "User",
      score,
      isMe: profile.id === userId,
      trend: "up" // Placeholder for trend
    };
  });

  // Sort descending by score
  leaderboard.sort((a, b) => b.score - a.score);

  // Add rank
  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  // Limit global to top 50
  const finalLeaderboard = type === "global" ? rankedLeaderboard.slice(0, 50) : rankedLeaderboard;

  return NextResponse.json({ data: finalLeaderboard });
}
