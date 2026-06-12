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
              "block rounded-lg border px-3 py-2 text-sm transition",
              isActive
                ? "border-brand bg-brand/10 text-brand"
                : "border-transparent text-text-dim hover:border-line hover:bg-bg-soft hover:text-text"
            )}
          >
            <p className="font-medium">{item.label}</p>
            <p className="mt-1 text-xs text-text-dim">{item.description}</p>
          </Link>
        );
      })}
    </nav>
  );
}
