"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export function SignOutButton({ bypassEnabled = false }: { bypassEnabled?: boolean }) {
  const router = useRouter();
  const { isLoaded, signOut } = useAuth();

  const handleSignOut = async () => {
    if (bypassEnabled) {
      router.push(routes.dashboard);
      return;
    }

    if (!isLoaded) {
      return;
    }

    await signOut();
    router.push(routes.login);
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
