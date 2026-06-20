import { routes } from "@/lib/routes";

export const APP_NAV = [
  {
    href: routes.dashboard,
    label: "Dashboard",
    description: "Progress harian dan statistik utama",
  },
  {
    href: routes.onboarding,
    label: "Onboarding",
    description: "Personalisasi target awal",
  },
  {
    href: routes.quests,
    label: "Daily Quest",
    description: "Mandatory, recommended, custom",
  },
  {
    href: routes.deen,
    label: "Deen Tracker",
    description: "Checklist ibadah dan streak",
  },
  {
    href: routes.fitness,
    label: "Fitness",
    description: "Push up, squat, run, progress",
  },
  {
    href: routes.water,
    label: "Water",
    description: "Target hidrasi dan reminder",
  },
  {
    href: routes.finance,
    label: "Finance",
    description: "Log transaksi harian",
  },
  {
    href: routes.planning,
    label: "Planning",
    description: "Budget dan savings goal",
  },
  {
    href: routes.avatar,
    label: "Avatar Shop",
    description: "Item, inventory, equip",
  },
  {
    href: routes.aiCoach,
    label: "AI Coach",
    description: "Asisten Deen & Life",
  },
  {
    href: routes.squad,
    label: "Squad",
    description: "Social retention lite",
  },
  {
    href: routes.study,
    label: "Study Tracker",
    description: "Jadwal kuliah & deadline tugas",
  },
  {
    href: routes.accessControl,
    label: "Access Control",
    description: "Role & permission management",
    adminOnly: true,
  },
  {
    href: routes.adminAudit,
    label: "Audit Logs",
    description: "Riwayat perubahan role admin",
    adminOnly: true,
  },
  {
    href: routes.admin,
    label: "Admin Console",
    description: "Master data dan admin system",
    adminOnly: true,
  },
  {
    href: routes.settings,
    label: "Settings",
    description: "Profil, reminder, export",
  },
] as const;

export const MANDATORY_PRAYERS = [
  "Shalat Subuh",
  "Shalat Dzuhur",
  "Shalat Ashar",
  "Shalat Maghrib",
  "Shalat Isya",
] as const;
