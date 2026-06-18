"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

export function SignOutButton({ bypassEnabled = false }: { bypassEnabled?: boolean }) {
  const router = useRouter();

  const handleSignOut = async () => {
    if (bypassEnabled) {
      router.push(routes.dashboard);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(routes.login);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-2xl border border-line bg-bg px-4 py-2 text-sm font-medium text-text transition hover:border-brand hover:bg-bg-soft"
    >
      Keluar
    </button>
  );
}
