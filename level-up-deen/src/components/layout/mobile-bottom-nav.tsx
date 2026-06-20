"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV } from "@/lib/constants";
import { useBottomNav } from "./use-bottom-nav";
import { useTranslation } from "@/components/providers";
import { TranslationKey } from "@/lib/i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { pins, isLoaded } = useBottomNav();
  const { t } = useTranslation();

  if (!isLoaded) return null; // Prevent hydration mismatch

  // Filter APP_NAV to only pinned items
  const activeNavItems = pins
    .map(href => APP_NAV.find(nav => nav.href === href))
    .filter(Boolean);

  const getNavLabel = (label: string): string => {
    const keyMap: Record<string, TranslationKey> = {
      "Dashboard": "dashboard",
      "Daily Quest": "quests",
      "Planning": "planning",
      "Finance": "finance",
      "Fitness": "fitness",
      "Water": "water",
      "Squad": "squad",
      "Settings": "settings",
      "Admin Console": "admin",
      "AI Coach": "aiCoach"
    };
    const key = keyMap[label];
    return key ? t(key) : label;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-bg/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around py-2">
        {activeNavItems.map((item) => {
          if (!item) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-center transition ${
                isActive ? "bg-brand-soft text-brand-strong" : "text-text-dim hover:bg-bg-soft hover:text-text"
              }`}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className={`text-[10px] font-medium uppercase tracking-[0.08em] ${isActive ? "text-brand-strong" : ""}`}>
                {getNavLabel(item.label)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
