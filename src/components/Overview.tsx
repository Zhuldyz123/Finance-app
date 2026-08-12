import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Plus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Wallet,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Account, Category, Goal, Transaction } from "../types";
import { calculateCategoryExpenses, calculateTotals, formatDateRussian, formatMoney } from "../utils/formatters";
import { CategoryIcon } from "./CategoryIcon";

interface OverviewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  currencySymbol: string;
  onOpenNewTxModal: () => void;
  onOpenAIPromptModal: () => void;
  onNavigateTab: (tab: string) => void;
  onEditGoal: (goal: Goal) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  transactions,
  categories,
  accounts,
  goals,
  currencySymbol,
  onOpenNewTxModal,
  onOpenAIPromptModal,
  onNavigateTab,
  onEditGoal,
}) => {
  const { income, expense, net, savingsRate } = calculateTotals(transactions);
  const totalAccountBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  const topExpenseCategories = calculateCategoryExpenses(transactions, categories).slice(0, 5);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Общий капитал по всем счетам
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {formatMoney(totalAccountBalance, currencySymbol)}
          </h1>
          <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Чистый итог за месяц:{" "}
            <strong className={net >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {net >= 0 ? "+" : ""}
              {formatMoney(net, currencySymbol)}
            </strong>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="relative z-10 flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={onOpenNewTxModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Записать операцию
          </button>
          <button
            onClick={onOpenAIPromptModal}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Sparkles size={18} />
            ИИ Ввод
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Доходы за месяц</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ArrowDownLeft size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(income, currencySymbol)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp size={14} /> Поступлений: {transactions.filter((t) => t.type === "income").length}
          </p>
        </div>

        {/* Expense Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Расходы за месяц</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(expense, currencySymbol)}
          </div>
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1">
            <TrendingDown size={14} /> Операций: {transactions.filter((t) => t.type === "expense").length}
          </p>
        </div>

        {/* Net Savings Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Остаток в копилку</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <PiggyBank size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(net, currencySymbol)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Доход за вычетом трат
          </p>
        </div>

        {/* Savings Rate % Card */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Норма сбережений</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{savingsRate}%</div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Accounts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Accounts list & Top Expenses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wallets & Accounts */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet size={18} className="text-blue-600" /> Счета и кошельки
              </h3>
              <button
                onClick={() => onNavigateTab("transactions")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                История перечислений <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-xl space-y-2 hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold truncate">{acc.name}</span>
                    {acc.accountNumber && (
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
                        {acc.accountNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatMoney(acc.balance, currencySymbol)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Expenses Categories Breakdown */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Топ категорий расходов
              </h3>
              <button
                onClick={() => onNavigateTab("analytics")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Подробная аналитика <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {topExpenseCategories.map((item) => (
                <div key={item.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: item.category.color }}
                      >
                        <CategoryIcon name={item.category.icon} size={15} />
                      </div>
                      {item.category.name}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatMoney(item.amount, currencySymbol)}{" "}
                      <span className="text-slate-400 text-[11px] font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity List */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Последние операции</h3>
              <button
                onClick={() => onNavigateTab("transactions")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Все
              </button>
            </div>

            <div className="space-y-3">
              {recentTransactions.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                const isIncome = tx.type === "income";
                const isTransfer = tx.type === "transfer";

                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: cat?.color || "#6b7280" }}
                      >
                        <CategoryIcon name={cat?.icon || "CircleDollarSign"} size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {tx.note || cat?.name || "Операция"}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {formatDateRussian(tx.date)}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-xs sm:text-sm font-bold whitespace-nowrap ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isTransfer
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {isIncome ? "+" : isTransfer ? "🔄 " : "-"}
                      {formatMoney(tx.amount, currencySymbol)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Goals Mini Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PiggyBank size={18} className="text-purple-600" /> Цели накоплений
              </h3>
              <button
                onClick={() => onNavigateTab("budgets")}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Управлять
              </button>
            </div>

            <div className="space-y-3">
              {goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{goal.title}</span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-purple-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Накоплено: {formatMoney(goal.currentAmount, currencySymbol)}</span>
                      <span>Цель: {formatMoney(goal.targetAmount, currencySymbol)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
