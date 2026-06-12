import { UserStats } from "@/lib/types";

const rankRules = [
  { min: 1, max: 9, rank: "E" as const },
  { min: 10, max: 19, rank: "D" as const },
  { min: 20, max: 34, rank: "C" as const },
  { min: 35, max: 49, rank: "B" as const },
  { min: 50, max: 74, rank: "A" as const },
  { min: 75, max: 99, rank: "S" as const },
  { min: 100, max: Number.POSITIVE_INFINITY, rank: "S+" as const },
];

export function expRequiredForNextLevel(currentLevel: number): number {
  return 100 + currentLevel * 50;
}

export function rankFromLevel(level: number): UserStats["rank"] {
  const matched = rankRules.find((rule) => level >= rule.min && level <= rule.max);
  return matched?.rank ?? "E";
}

export function calculateLevelFromTotalExp(totalExp: number) {
  let level = 1;
  let remaining = totalExp;

  while (remaining >= expRequiredForNextLevel(level)) {
    remaining -= expRequiredForNextLevel(level);
    level += 1;
  }

  return {
    level,
    currentExp: remaining,
    nextLevelExp: expRequiredForNextLevel(level),
    rank: rankFromLevel(level),
  };
}

export function completionRate(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}
