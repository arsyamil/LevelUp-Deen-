import { auth, clerkClient, verifyToken } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getAuthBypassUserId, isAuthBypassEnabled, serverEnv } from "@/lib/env";
import { RoleKey, roleDefinitions } from "@/lib/rbac";

export interface ClerkAuthContext {
  userId: string;
  email: string;
  role: RoleKey;
}

export interface AuthFailure {
  error: "Unauthorized" | "Forbidden";
  status: 401 | 403;
}

const clerkSessionCookieName = "__session";

function getClerkSessionTokenCandidates() {
  return Array.from(
    new Set(
      cookies()
        .getAll()
        .filter(
          (cookie) =>
            Boolean(cookie.value) &&
            (cookie.name === clerkSessionCookieName ||
              cookie.name.startsWith(`${clerkSessionCookieName}_`))
        )
        .map((cookie) => cookie.value)
    )
  );
}

export async function getCurrentUserId() {
  if (isAuthBypassEnabled()) {
    return getAuthBypassUserId();
  }

  if (!serverEnv.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const { userId } = await auth();
    if (userId) {
      return userId;
    }
  } catch {
    // Fall back to direct cookie verification if Clerk request state is unavailable.
  }

  const sessionTokens = getClerkSessionTokenCandidates();
  for (const sessionToken of sessionTokens) {
    try {
      const verifiedToken = await verifyToken(sessionToken, {
        secretKey: serverEnv.CLERK_SECRET_KEY,
      });
      return verifiedToken.sub ?? null;
    } catch {
      // Try the next Clerk session cookie candidate.
    }
  }

  return null;
}

export function normalizeRole(role: unknown): RoleKey {
  const value = typeof role === "string" ? role : "user";
  return roleDefinitions.some((item) => item.key === value) ? (value as RoleKey) : "user";
}

export function isAdminRole(role: RoleKey) {
  return role === "admin_system";
}

export async function getClerkUserById(userId: string) {
  try {
    const client = await clerkClient();
    return await client.users.getUser(userId);
  } catch {
    return null;
  }
}

export async function getCurrentClerkAuthContext(): Promise<ClerkAuthContext | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  if (isAuthBypassEnabled()) {
    return {
      userId,
      email: "demo@levelupdeen.local",
      role: normalizeRole(serverEnv.AUTH_BYPASS_ROLE ?? "admin_system"),
    };
  }

  const user = await getClerkUserById(userId);
  if (!user) {
    return null;
  }

  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? "";

  return {
    userId,
    email,
    role: normalizeRole(user.publicMetadata?.role),
  };
}

export async function requireAdminContext(): Promise<ClerkAuthContext | AuthFailure> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "Unauthorized", status: 401 };
  }

  if (isAuthBypassEnabled()) {
    const role = normalizeRole(serverEnv.AUTH_BYPASS_ROLE ?? "admin_system");
    if (!isAdminRole(role)) {
      return { error: "Forbidden", status: 403 };
    }

    return {
      userId,
      email: "demo@levelupdeen.local",
      role,
    };
  }

  const user = await getClerkUserById(userId);
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const role = normalizeRole(user.publicMetadata?.role);

  if (!isAdminRole(role)) {
    return { error: "Forbidden", status: 403 };
  }

  const email =
    user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? "";

  return {
    userId,
    email,
    role,
  };
}

export function isAuthFailure(value: ClerkAuthContext | AuthFailure): value is AuthFailure {
  return "error" in value;
}
