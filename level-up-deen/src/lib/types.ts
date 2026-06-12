export type TaskCategory = "deen" | "fitness" | "mind" | "water" | "finance";

export type TaskType = "mandatory" | "recommended" | "custom" | "bonus";

export type TaskLogStatus = "completed" | "pending" | "skipped";

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  timezone: string;
  userType: "mahasiswa" | "pekerja" | "santri" | "freelancer" | "lainnya";
  onboardingCompleted: boolean;
}

export interface UserStats {
  level: number;
  rank: "E" | "D" | "C" | "B" | "A" | "S" | "S+";
  totalExp: number;
  currentExp: number;
  nextLevelExp: number;
  coins: number;
  prayerStreak: number;
  fullQuestStreak: number;
}

export interface DailyTask {
  id: string;
  name: string;
  category: TaskCategory;
  taskType: TaskType;
  targetValue?: number;
  targetUnit?: string;
  expReward: number;
  coinReward: number;
  status: TaskLogStatus;
}

export interface FinancialTransaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
  transactionDate: string;
}

export interface BudgetItem {
  category: string;
  budget: number;
  spent: number;
}

export interface SavingsGoal {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  itemType: "skin" | "aura" | "frame" | "title" | "badge";
  rarity: "common" | "rare" | "epic" | "legendary";
  priceCoin: number;
  unlockLevel: number;
  owned: boolean;
  equipped: boolean;
}

export interface OnboardingAnswers {
  userType: UserProfile["userType"];
  goals: Array<"ibadah" | "olahraga" | "belajar" | "finansial">;
  dailyTimeMinutes: number;
  pushUpBase: number;
  squatBase: number;
  pullUpBase: number;
  runBaseKm: number;
  tilawahTarget: string;
  waterTargetMl: number;
  monthlyIncome: number;
}

export interface PersonalizationPlan {
  dailyQuests: string[];
  fitnessTargets: {
    pushUp: number;
    squat: number;
    pullUp: number;
    runKm: number;
  };
  tilawahTarget: string;
  waterTargetMl: number;
  suggestedReminders: string[];
}

export interface FinanceParseResult {
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
}
