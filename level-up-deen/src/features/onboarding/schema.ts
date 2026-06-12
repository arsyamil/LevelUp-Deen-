import { z } from "zod";

export const onboardingSchema = z.object({
  userType: z.enum(["mahasiswa", "pekerja", "santri", "freelancer", "lainnya"]),
  goals: z
    .array(z.enum(["ibadah", "olahraga", "belajar", "finansial"]))
    .min(1, "Pilih minimal satu goal"),
  dailyTimeMinutes: z.number().int().min(10).max(180),
  pushUpBase: z.number().int().min(0).max(200),
  squatBase: z.number().int().min(0).max(300),
  pullUpBase: z.number().int().min(0).max(100),
  runBaseKm: z.number().min(0).max(20),
  tilawahTarget: z.string().min(1),
  waterTargetMl: z.number().int().min(500).max(5000),
  monthlyIncome: z.number().min(0),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
