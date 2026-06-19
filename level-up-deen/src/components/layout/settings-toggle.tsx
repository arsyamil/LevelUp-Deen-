"use client";

import { useTheme } from "next-themes";
import { useTranslation } from "@/components/providers";

export function SettingsToggle() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-bg-soft p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-text-dim">Theme</span>
        <div className="flex gap-1 rounded bg-bg p-1">
          <button
            onClick={() => setTheme("light")}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              theme === "light" ? "bg-brand-soft text-brand-strong font-medium" : "text-text hover:text-brand"
            }`}
          >
            ☀️ Light
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              theme === "dark" ? "bg-brand-soft text-brand-strong font-medium" : "text-text hover:text-brand"
            }`}
          >
            🌙 Dark
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-text-dim">Language</span>
        <div className="flex gap-1 rounded bg-bg p-1">
          <button
            onClick={() => setLang("id")}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              lang === "id" ? "bg-brand-soft text-brand-strong font-medium" : "text-text hover:text-brand"
            }`}
          >
            🇮🇩 ID
          </button>
          <button
            onClick={() => setLang("en")}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              lang === "en" ? "bg-brand-soft text-brand-strong font-medium" : "text-text hover:text-brand"
            }`}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>
    </div>
  );
}
