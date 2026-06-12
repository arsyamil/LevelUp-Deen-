import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_ENV: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
});

const serverEnvSchema = z.object({
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  AUTH_BYPASS_ENABLED: z.string().optional(),
  AUTH_BYPASS_USER_ID: z.string().optional(),
  AUTH_BYPASS_ROLE: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
});

const parsedPublicEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsedPublicEnv.success) {
  const details = parsedPublicEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid public env config: ${details}`);
}

const parsedServerEnv = serverEnvSchema.safeParse({
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AUTH_BYPASS_ENABLED: process.env.AUTH_BYPASS_ENABLED,
  AUTH_BYPASS_USER_ID: process.env.AUTH_BYPASS_USER_ID,
  AUTH_BYPASS_ROLE: process.env.AUTH_BYPASS_ROLE,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
});

if (!parsedServerEnv.success) {
  const details = parsedServerEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid server env config: ${details}`);
}

export const publicEnv = parsedPublicEnv.data;
export const serverEnv = parsedServerEnv.data;

export function isAuthBypassEnabled() {
  return serverEnv.AUTH_BYPASS_ENABLED === "true" && publicEnv.NEXT_PUBLIC_APP_ENV !== "production";
}

export function getAuthBypassUserId() {
  return serverEnv.AUTH_BYPASS_USER_ID || "dev-demo-user";
}

export function hasSupabaseClientEnv() {
  return Boolean(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function requireSupabaseClientEnv() {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase public env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return { url, anonKey };
}
