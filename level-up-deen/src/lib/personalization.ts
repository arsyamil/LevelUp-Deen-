import { OnboardingAnswers, PersonalizationPlan, TaskCategory, TaskType } from "@/lib/types";

export interface SeedDailyTask {
  code: string;
  name: string;
  category: TaskCategory;
  taskType: TaskType;
  targetValue?: number;
  targetUnit?: string;
  expReward: number;
  coinReward: number;
  isSystemRequired: boolean;
  isDeletable: boolean;
  description: string;
}

export const mandatoryPrayerTasks: SeedDailyTask[] = [
  {
    code: "prayer-subuh",
    name: "Shalat Subuh",
    category: "deen",
    taskType: "mandatory",
    expReward: 20,
    coinReward: 1,
    isSystemRequired: true,
    isDeletable: false,
    description: "Mandatory prayer seeded during onboarding",
  },
  {
    code: "prayer-dzuhur",
    name: "Shalat Dzuhur",
    category: "deen",
    taskType: "mandatory",
    expReward: 20,
    coinReward: 1,
    isSystemRequired: true,
    isDeletable: false,
    description: "Mandatory prayer seeded during onboarding",
  },
  {
    code: "prayer-ashar",
    name: "Shalat Ashar",
    category: "deen",
    taskType: "mandatory",
    expReward: 20,
    coinReward: 1,
    isSystemRequired: true,
    isDeletable: false,
    description: "Mandatory prayer seeded during onboarding",
  },
  {
    code: "prayer-maghrib",
    name: "Shalat Maghrib",
    category: "deen",
    taskType: "mandatory",
    expReward: 20,
    coinReward: 1,
    isSystemRequired: true,
    isDeletable: false,
    description: "Mandatory prayer seeded during onboarding",
  },
  {
    code: "prayer-isya",
    name: "Shalat Isya",
    category: "deen",
    taskType: "mandatory",
    expReward: 20,
    coinReward: 1,
    isSystemRequired: true,
    isDeletable: false,
    description: "Mandatory prayer seeded during onboarding",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function slugifyTaskCode(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function inferCategory(name: string): TaskCategory {
  const lower = name.toLowerCase();
  if (lower.includes("shalat") || lower.includes("tilawah")) return "deen";
  if (
    lower.includes("push") ||
    lower.includes("squat") ||
    lower.includes("lari") ||
    lower.includes("run")
  ) {
    return "fitness";
  }
  if (lower.includes("minum") || lower.includes("air")) return "water";
  if (lower.includes("catat transaksi") || lower.includes("transaksi") || lower.includes("uang")) {
    return "finance";
  }
  if (lower.includes("belajar")) return "mind";
  return "deen";
}

export function generatePersonalizationPlan(
  answers: OnboardingAnswers
): PersonalizationPlan {
  const timeFactor = clamp(Math.floor(answers.dailyTimeMinutes / 20), 1, 4);

  const fitnessTargets = {
    pushUp: clamp(answers.pushUpBase + timeFactor * 2, 4, 80),
    squat: clamp(answers.squatBase + timeFactor * 4, 6, 120),
    pullUp: clamp(answers.pullUpBase + Math.floor(timeFactor / 2), 0, 25),
    runKm: clamp(Number((answers.runBaseKm + timeFactor * 0.25).toFixed(1)), 0.5, 10),
  };

  const dailyQuests = [
    "Shalat 5 waktu",
    `Tilawah ${answers.tilawahTarget}`,
    `Push up ${fitnessTargets.pushUp} reps`,
    `Minum ${answers.waterTargetMl} ml`,
    "Catat transaksi harian",
  ];

  if (answers.goals.includes("belajar")) {
    dailyQuests.push("Belajar fokus 20-30 menit");
  }

  return {
    dailyQuests,
    fitnessTargets,
    tilawahTarget: answers.tilawahTarget,
    waterTargetMl: answers.waterTargetMl,
    suggestedReminders: [
      "05:00 - Persiapan Subuh",
      "07:00 - Dzikir dan target hari ini",
      "12:15 - Dzuhur check-in",
      "20:30 - Evaluasi harian",
    ],
  };
}

export function buildRecommendedSeedTasks(plan: PersonalizationPlan): SeedDailyTask[] {
  return plan.dailyQuests
    .filter((quest) => quest.toLowerCase() !== "shalat 5 waktu")
    .map((quest) => ({
      code: slugifyTaskCode(quest),
      name: quest,
      category: inferCategory(quest),
      taskType: "recommended",
      targetUnit: undefined,
      expReward: 15,
      coinReward: 0,
      isSystemRequired: false,
      isDeletable: true,
      description: "Auto-generated from onboarding",
    }));
}

export function buildOnboardingSeedTasks(plan: PersonalizationPlan): SeedDailyTask[] {
  return [...mandatoryPrayerTasks, ...buildRecommendedSeedTasks(plan)];
}
