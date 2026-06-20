"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";

export interface ChartData {
  date: string;
  users?: number;
  income?: number;
  expense?: number;
}

interface Props {
  userActivityData: ChartData[];
  financeData: ChartData[];
}

export function AnalyticsCharts({ userActivityData, financeData }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* User Activity Chart */}
      <Card className="p-5 flex flex-col h-80">
        <h3 className="font-semibold text-sm mb-4">Aktivitas Pengguna (7 Hari Terakhir)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                itemStyle={{ color: "#f8fafc" }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                name="Pengguna Aktif" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#818cf8", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Financial Transactions Chart */}
      <Card className="p-5 flex flex-col h-80">
        <h3 className="font-semibold text-sm mb-4">Sirkulasi Finansial (7 Hari Terakhir)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `Rp${val/1000}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                cursor={{ fill: "#334155", opacity: 0.4 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0))}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
