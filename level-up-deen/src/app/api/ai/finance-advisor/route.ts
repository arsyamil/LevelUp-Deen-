import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ advice: "API Key Gemini belum dikonfigurasi." });
  }

  try {
    const admin = createSupabaseAdminClient();

    // Ambil data 3 bulan terakhir
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const startDate = date.toISOString();

    const [txRes, accRes, debtRes, ziswafRes] = await Promise.all([
      admin.from("financial_transactions").select("type, amount, category:category_id(name), transaction_date").eq("user_id", userId).gte("transaction_date", startDate),
      admin.from("financial_accounts").select("name, balance, type").eq("user_id", userId),
      admin.from("financial_debts").select("type, remaining_amount, status").eq("user_id", userId).eq("status", "active"),
      admin.from("ziswaf_records").select("type, amount").eq("user_id", userId).gte("date", startDate),
    ]);

    const txs = (txRes.data || []).map(t => ({ type: t.type, amount: t.amount, category: (t as any).category?.name }));
    const accounts = accRes.data || [];
    const debts = debtRes.data || [];
    const ziswaf = ziswafRes.data || [];

    const totalAset = accounts.reduce((acc, curr) => acc + curr.balance, 0);
    const totalHutang = debts.filter(d => d.type === "payable").reduce((acc, curr) => acc + curr.remaining_amount, 0);
    const totalPiutang = debts.filter(d => d.type === "receivable").reduce((acc, curr) => acc + curr.remaining_amount, 0);
    const totalIncome = txs.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = txs.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
    const totalZiswaf = ziswaf.reduce((acc, curr) => acc + curr.amount, 0);

    const promptContext = `
Sebagai Konsultan Keuangan Islami untuk pengguna aplikasi Level Up Deen.
Berikut adalah ringkasan keuangan pengguna (3 bulan terakhir):
- Total Aset Tunai/Bank: Rp ${totalAset.toLocaleString("id-ID")}
- Total Hutang Aktif: Rp ${totalHutang.toLocaleString("id-ID")}
- Total Piutang Aktif: Rp ${totalPiutang.toLocaleString("id-ID")}
- Total Pemasukan: Rp ${totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")}
- Total ZISWAF (Zakat/Infaq/Sedekah/Waqaf): Rp ${totalZiswaf.toLocaleString("id-ID")}

Berikan evaluasi finansial dan saran (dalam bahasa Indonesia yang memotivasi dan islami, maksimal 4 paragraf pendek). 
Evaluasi harus mencakup:
1. Kesehatan arus kas (Income vs Expense)
2. Rasio Hutang terhadap Aset
3. Pengingat/Apresiasi ZISWAF (Nisab zakat harta sekitar 85 gram emas atau ~Rp 85 Juta)
4. Rekomendasi 1 aksi nyata yang harus dilakukan bulan ini.
Tulis dalam format Markdown tanpa perlu membuat sapaan pembuka.
`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(promptContext);
    const advice = result.response.text();

    return NextResponse.json({ advice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
