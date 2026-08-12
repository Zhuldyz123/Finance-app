import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Category, Transaction } from "../types";
import { calculateCategoryExpenses, calculateTotals, formatMoney } from "../utils/formatters";
import { CategoryIcon } from "./CategoryIcon";

interface AnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
  categories,
  currencySymbol,
}) => {
  const [period, setPeriod] = useState<"all" | "this-month" | "last-month">("all");

  const { income, expense, net, savingsRate } = calculateTotals(transactions);
  const categoryExpenses = calculateCategoryExpenses(transactions, categories);

  // Prepare Pie Chart data
  const pieData = categoryExpenses.map((item) => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
  }));

  // Prepare Timeline BarChart Data (Group by Date YYYY-MM-DD)
  const dateMap = new Map<string, { date: string; income: number; expense: number }>();

  transactions.forEach((tx) => {
    const dStr = tx.date;
    const existing = dateMap.get(dStr) || { date: dStr, income: 0, expense: 0 };
    if (tx.type === "income") {
      existing.income += tx.amount;
    } else if (tx.type === "expense") {
      existing.expense += tx.amount;
    }
    dateMap.set(dStr, existing);
  });

  const timelineData = Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Финансовая Аналитика</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Визуальный анализ доходов, расходов и структуры бюджета
          </p>
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Доходы</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(income, currencySymbol)}
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Расходы</span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(expense, currencySymbol)}
          </div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Норма сбережений</span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{savingsRate}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Dynamic Bar Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Динамика доходов и расходов по дням
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => formatMoney(Number(val), currencySymbol)}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="income" name="Доход" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Расход" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Donut Pie Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Структура расходов по категориям
          </h3>
          {pieData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
              Нет расходов за выбранный период
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatMoney(Number(val), currencySymbol)}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Expense Detailed Table */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Детализация расходов по категориям
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3 rounded-l-xl">Категория</th>
                <th className="p-3">Кол-во трат</th>
                <th className="p-3">Сумма</th>
                <th className="p-3 rounded-r-xl">% от всех расходов</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoryExpenses.map((cat) => (
                <tr key={cat.category.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 flex items-center gap-2.5 font-bold text-slate-900 dark:text-white">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: cat.category.color }}
                    >
                      <CategoryIcon name={cat.category.icon} size={15} />
                    </div>
                    {cat.category.name}
                  </td>
                  <td className="p-3 font-semibold">{cat.count} трат</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {formatMoney(cat.amount, currencySymbol)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.category.color,
                          }}
                        />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{cat.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
