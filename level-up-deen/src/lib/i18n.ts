export type Language = "id" | "en";

export const translations = {
  id: {
    dashboard: "Dasbor",
    quests: "Misi Harian",
    planning: "Perencanaan",
    finance: "Keuangan",
    fitness: "Kebugaran",
    water: "Hidrasi",
    squad: "Grup (Squad)",
    achievements: "Pencapaian",
    history: "Riwayat",
    settings: "Pengaturan",
    admin: "Admin Console",
    aiCoach: "AI Coach",
    levelUpDeen: "LEVEL UP DEEN",
    welcome: "Assalamu alaikum,",
    themeLight: "Mode Terang",
    themeDark: "Mode Gelap",
    themeSystem: "Sistem",
    languageId: "Bahasa Indonesia",
    languageEn: "English",
  },
  en: {
    dashboard: "Dashboard",
    quests: "Daily Quests",
    planning: "Planning",
    finance: "Finance",
    fitness: "Fitness",
    water: "Hydration",
    squad: "Squad",
    achievements: "Achievements",
    history: "History",
    settings: "Settings",
    admin: "Admin Console",
    aiCoach: "AI Coach",
    levelUpDeen: "LEVEL UP DEEN",
    welcome: "Peace be upon you,",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    themeSystem: "System",
    languageId: "Bahasa Indonesia",
    languageEn: "English",
  }
};

export type TranslationKey = keyof typeof translations.id;

export function getServerTranslation(cookieLang: string | undefined) {
  const lang: Language = (cookieLang === "en" || cookieLang === "id") ? cookieLang : "id";
  return {
    lang,
    t: (key: TranslationKey) => translations[lang][key] || translations["id"][key] || key
  };
}
