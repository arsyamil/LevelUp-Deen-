"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function AppNav({ showAdmin = false }: { showAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {APP_NAV.filter((item) => !("adminOnly" in item && item.adminOnly) || showAdmin).map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded border px-3 py-2 text-sm transition duration-300",
              isActive
                ? "border-line-strong bg-brand-soft text-brand-strong shadow-[0_0_12px_rgba(26,80,128,0.25)]"
                : "border-transparent text-text-dim hover:border-line-medium hover:bg-bg-soft hover:text-text"
            )}
          >
            <p className="font-medium uppercase tracking-[0.06em]">{item.label}</p>
            <p className="mt-1 text-xs text-text-dim">{item.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
