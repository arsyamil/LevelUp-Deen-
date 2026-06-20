"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { SettingsToggle } from "@/components/layout/settings-toggle";
import { useTranslation } from "@/components/providers";
import { TranslationKey } from "@/lib/i18n";
import { useBottomNav } from "./use-bottom-nav";

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export function MobileMenu({ showAdmin = false }: { showAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { pins, togglePin } = useBottomNav();

  // Helper to map route to translation key
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
      "AI Coach": "aiCoach",
      "Achievements": "achievements"
    };
    const key = keyMap[label];
    return key ? t(key) : label;
  };

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-2 text-text-dim hover:text-text transition-colors"
        aria-label="Buka Menu Utama"
      >
        <MenuIcon />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="relative flex w-[280px] max-w-[80vw] flex-col bg-bg border-r border-line h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-line">
              <span className="cosmic-gradient-text font-semibold uppercase tracking-[0.12em]">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 text-text-dim hover:text-danger transition-colors">
                <CloseIcon />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-24">
              {APP_NAV.filter((item) => !("adminOnly" in item && item.adminOnly) || showAdmin).map((item) => {
                const isActive = pathname === item.href;
                const isPinned = pins.includes(item.href);
                return (
                  <div key={item.href} className="relative flex items-center group">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex-1 rounded-lg px-4 py-3 text-sm transition-colors mr-10",
                        isActive
                          ? "bg-brand-soft text-brand-strong font-semibold shadow-[0_0_12px_rgba(26,80,128,0.25)]"
                          : "text-text-dim hover:bg-bg-soft hover:text-text"
                      )}
                    >
                      <span className="mr-2">{item.emoji}</span>
                      {getNavLabel(item.label)}
                    </Link>
                    <button
                      onClick={() => togglePin(item.href)}
                      className={cn(
                        "absolute right-2 p-2 rounded-full transition-colors",
                        isPinned ? "text-brand" : "text-text-dim/30 hover:text-text-dim"
                      )}
                      aria-label={isPinned ? "Lepas dari navigasi bawah" : "Sematkan ke navigasi bawah"}
                      title={isPinned ? "Lepas dari navigasi bawah" : "Sematkan ke navigasi bawah"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                    </button>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-line bg-bg/95 backdrop-blur-sm">
              <SettingsToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
