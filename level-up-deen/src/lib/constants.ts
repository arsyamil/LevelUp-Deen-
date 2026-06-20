import { routes } from "@/lib/routes";

export const APP_NAV = [
  {
    href: routes.dashboard,
    label: "Dashboard",
    description: "Progress harian dan statistik utama",
    emoji: "🏠",
  },
  {
    href: routes.onboarding,
    label: "Onboarding",
    description: "Personalisasi target awal",
    emoji: "👋",
  },
  {
    href: routes.quests,
    label: "Daily Quest",
    description: "Mandatory, recommended, custom",
    emoji: "⚡",
  },
  {
    href: routes.deen,
    label: "Deen Tracker",
    description: "Checklist ibadah dan streak",
    emoji: "🕌",
  },
  {
    href: routes.fitness,
    label: "Fitness",
    description: "Push up, squat, run, progress",
    emoji: "💪",
  },
  {
    href: routes.water,
    label: "Water",
    description: "Target hidrasi dan reminder",
    emoji: "💧",
  },
  {
    href: routes.finance,
    label: "Finance",
    description: "Log transaksi harian",
    emoji: "💰",
  },
  {
    href: routes.planning,
    label: "Planning",
    description: "Budget dan savings goal",
    emoji: "📊",
  },
  {
    href: routes.avatar,
    label: "Avatar Shop",
    description: "Item, inventory, equip",
    emoji: "🧑‍🎨",
  },
  {
    href: routes.aiCoach,
    label: "AI Coach",
    description: "Asisten Deen & Life",
    emoji: "🤖",
  },
  {
    href: routes.squad,
    label: "Squad",
    description: "Social retention lite",
    emoji: "👥",
  },
  {
    href: routes.study,
    label: "Study Tracker",
    description: "Jadwal kuliah & deadline tugas",
    emoji: "📚",
  },
  {
    href: routes.accessControl,
    label: "Access Control",
    description: "Role & permission management",
    adminOnly: true,
    emoji: "🔐",
  },
  {
    href: routes.adminAudit,
    label: "Audit Logs",
    description: "Riwayat perubahan role admin",
    adminOnly: true,
    emoji: "📋",
  },
  {
    href: routes.admin,
    label: "Admin Console",
    description: "Master data dan admin system",
    adminOnly: true,
    emoji: "⚙️",
  },
  {
    href: routes.settings,
    label: "Settings",
    description: "Profil, reminder, export",
    emoji: "⚙️",
  },
] as const;

export const MANDATORY_PRAYERS = [
  "Shalat Subuh",
  "Shalat Dzuhur",
  "Shalat Ashar",
  "Shalat Maghrib",
  "Shalat Isya",
] as const;
