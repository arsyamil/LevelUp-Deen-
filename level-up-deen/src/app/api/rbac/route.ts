import { NextResponse } from "next/server";
import { permissionMatrix, roleDefinitions, userRoleAssignments } from "@/lib/rbac";

export async function GET() {
  return NextResponse.json({
    roles: roleDefinitions,
    permissions: permissionMatrix,
    assignments: userRoleAssignments,
  });
}
