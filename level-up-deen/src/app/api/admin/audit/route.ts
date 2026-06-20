import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminContext, isAuthFailure } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdminContext();
  if (isAuthFailure(adminCheck)) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("system_audit_logs")
    .select("*, users_profile!actor_user_id(username, email)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (action) {
    query = query.eq("action", action);
  }
  if (entityType) {
    query = query.eq("entity_type", entityType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ logs: data || [] });
}
