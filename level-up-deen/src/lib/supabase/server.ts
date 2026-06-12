import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseClientEnv, serverEnv } from "@/lib/env";

export function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseClientEnv();

  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // set may fail in read-only contexts (e.g. Server Components)
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set(name, "", options);
        } catch {
          // remove may fail in read-only contexts
        }
      },
    },
  });
}

export function createSupabaseAdminClient() {
  const { url } = requireSupabaseClientEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv;

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY in server environment for admin actions."
    );
  }

  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}
