import { FinanceParseResult, SavingsGoal } from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

const FINANCE_SYSTEM_PROMPT = `Kamu adalah parser transaksi keuangan untuk aplikasi Level Up Deen (Indonesia).
Tugas: ekstrak informasi dari catatan transaksi natural language.

Selalu balas HANYA dengan JSON valid (tidak ada teks lain), format:
{
  "type": "income" | "expense" | "transfer",
  "category": string,
  "amount": number,
  "note": string
}

Kategori yang tersedia:
- "Makan dan minum" (makanan, minuman, kopi, resto, warteg)
- "Transportasi" (ojek, bensin, tol, parkir, commuter)
- "Ibadah dan sedekah" (sedekah, zakat, infak, donasi)
- "Pendidikan" (buku, kursus, kuliah, seminar)
- "Kesehatan" (obat, dokter, vitamin, gym)
- "Belanja" (pakaian, elektronik, household)
- "Income utama" (gaji, salary, upah)
- "Freelance" (proyek, honorarium, jasa)
- "Lainnya" (default jika tidak cocok)

Rules:
- amount dalam rupiah penuh (50rb = 50000, 1jt = 1000000)
- type "income" jika ada kata: gaji, masuk, income, terima, dapat
- type "transfer" jika ada kata: transfer antar, pindah dana, mutasi antar akun
- type "expense" untuk semua lainnya
- note: salin teks asli dari user
- Jika jumlah tidak jelas, amount = 0`;

function normalizeAmount(raw: string, suffix?: string): number {
  const value = Number(raw.replace(/[.,]/g, ""));
  if (Number.isNaN(value)) return 0;
  if (!suffix) return value;
  const lower = suffix.toLowerCase();
  if (lower === "k" || lower === "rb" || lower === "ribu") return value * 1000;
  if (lower === "jt" || lower === "juta") return value * 1_000_000;
  return value;
}

// Regex-based fallback (synchronous, no API needed)
export function parseNaturalTransaction(note: string): FinanceParseResult {
  const lowered = note.toLowerCase();
  const amountMatch = lowered.match(/(\d+[\d.,]*)\s*(k|rb|ribu|jt|juta)?/i);
  const amount = amountMatch
    ? normalizeAmount(amountMatch[1] ?? "0", amountMatch[2] ?? undefined)
    : 0;

  let category = "Lainnya";
  if (/(makan|warteg|kopi|resto|food|minum)/i.test(lowered)) category = "Makan dan minum";
  if (/(transport|ojek|bensin|tol|parkir|commuter)/i.test(lowered)) category = "Transportasi";
  if (/(sedekah|zakat|infak|donasi)/i.test(lowered)) category = "Ibadah dan sedekah";
  if (/(buku|kelas|kursus|kuliah|seminar)/i.test(lowered)) category = "Pendidikan";
  if (/(obat|dokter|vitamin|gym|apotek)/i.test(lowered)) category = "Kesehatan";
  if (/(baju|pakaian|elektronik)/i.test(lowered)) category = "Belanja";
  if (/(gaji|salary|upah)/i.test(lowered)) category = "Income utama";
  if (/(freelance|proyek|honorarium|jasa)/i.test(lowered)) category = "Freelance";

  let type: FinanceParseResult["type"] = "expense";
  if (/(gaji|masuk|income|salary|terima|dapat)/i.test(lowered)) type = "income";
  else if (/(transfer antar|pindah dana|mutasi antar)/i.test(lowered)) type = "transfer";

  return { type, category, amount, note };
}

// Gemini-powered async parser
export async function parseNaturalTransactionAI(note: string): Promise<FinanceParseResult> {
  if (!GEMINI_API_KEY) {
    return parseNaturalTransaction(note);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: FINANCE_SYSTEM_PROMPT,
    });

    const result = await model.generateContent(note);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as FinanceParseResult;

    // Validate required fields
    if (
      typeof parsed.type === "string" &&
      typeof parsed.category === "string" &&
      typeof parsed.amount === "number"
    ) {
      return { ...parsed, note };
    }
  } catch {
    // Fall through to regex fallback
  }

  return parseNaturalTransaction(note);
}

export function forecastSavingsDate(goal: SavingsGoal, averageNetSavingPerMonth: number) {
  if (averageNetSavingPerMonth <= 0) {
    return { monthsNeeded: null, predictedDate: null, risk: "high" as const };
  }
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const monthsNeeded = Math.ceil(remaining / averageNetSavingPerMonth);
  const predicted = new Date();
  predicted.setMonth(predicted.getMonth() + monthsNeeded);
  const risk: "low" | "medium" | "high" =
    monthsNeeded <= 3 ? "low" : monthsNeeded <= 6 ? "medium" : "high";
  return { monthsNeeded, predictedDate: predicted.toISOString().slice(0, 10), risk };
}
