import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseClientEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabaseClientEnv();

  return createBrowserClient(url, anonKey);
}
