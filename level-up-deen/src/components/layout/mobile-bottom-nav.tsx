"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";

const BOTTOM_NAV = [
  { href: routes.dashboard, label: "Home", emoji: "🏠" },
  { href: routes.quests, label: "Quest", emoji: "⚡" },
  { href: routes.deen, label: "Deen", emoji: "🕌" },
  { href: routes.finance, label: "Finance", emoji: "💰" },
  { href: routes.aiCoach, label: "Coach", emoji: "🤖" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-bg/95 backdrop-blur-sm lg:hidden">
      <div className="flex items-center justify-around py-2">
        {BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-center transition ${
                isActive ? "text-brand" : "text-text-dim hover:text-text"
              }`}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className={`text-[10px] font-medium ${isActive ? "text-brand" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
