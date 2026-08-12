import React, { useState } from "react";
import {
  Target,
  PiggyBank,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  ArrowRight,
} from "lucide-react";
import { Account, Category, Goal, Transaction } from "../types";
import { calculateCategoryExpenses, formatMoney } from "../utils/formatters";
import { CategoryIcon } from "./CategoryIcon";

interface BudgetsAndGoalsProps {
  categories: Category[];
  transactions: Transaction[];
  accounts: Account[];
  goals: Goal[];
  currencySymbol: string;
  onUpdateCategoryBudget: (categoryId: string, newBudget: number) => void;
  onSaveGoal: (goal: Omit<Goal, "id">, editId?: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onDepositToGoal: (goalId: string, amount: number, accountId: string) => void;
}

export const BudgetsAndGoals: React.FC<BudgetsAndGoalsProps> = ({
  categories,
  transactions,
  accounts,
  goals,
  currencySymbol,
  onUpdateCategoryBudget,
  onSaveGoal,
  onDeleteGoal,
  onDepositToGoal,
}) => {
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState<string>("");

  // Goal Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalNote, setGoalNote] = useState("");

  // Deposit Modal State
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositAccountId, setDepositAccountId] = useState(accounts[0]?.id || "");

  const categoryExpenses = calculateCategoryExpenses(transactions, categories);

  const handleStartEditBudget = (cat: Category) => {
    setEditingBudgetId(cat.id);
    setBudgetInput(cat.budget ? cat.budget.toString() : "0");
  };

  const handleSaveBudget = (catId: string) => {
    const parsed = parseFloat(budgetInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateCategoryBudget(catId, parsed);
    }
    setEditingBudgetId(null);
  };

  const handleOpenGoalModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setGoalTitle(goal.title);
      setGoalTargetAmount(goal.targetAmount.toString());
      setGoalDeadline(goal.deadline || "");
      setGoalNote(goal.note || "");
    } else {
      setEditingGoal(null);
      setGoalTitle("");
      setGoalTargetAmount("");
      setGoalDeadline("");
      setGoalNote("");
    }
    setIsGoalModalOpen(true);
  };

  const handleSaveGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTargetAmount);
    if (!goalTitle.trim() || isNaN(target) || target <= 0) {
      alert("Пожалуйста, загляните в корректность полей цели");
      return;
    }

    onSaveGoal(
      {
        title: goalTitle,
        targetAmount: target,
        currentAmount: editingGoal ? editingGoal.currentAmount : 0,
        deadline: goalDeadline || undefined,
        category: "Копилка",
        color: "#3b82f6",
        icon: "PiggyBank",
        note: goalNote,
      },
      editingGoal?.id
    );

    setIsGoalModalOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Введите корректную сумму пополнения");
      return;
    }

    onDepositToGoal(depositGoal.id, amount, depositAccountId);
    setDepositGoal(null);
    setDepositAmount("");
  };

  const expenseCategoriesWithBudgets = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-8">
      {/* Category Monthly Budgets Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target size={22} className="text-blue-600" /> Месячные Бюджеты по категориям
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Устанавливайте лимиты расходов, чтобы избежать перетрат
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenseCategoriesWithBudgets.map((cat) => {
            const expenseItem = categoryExpenses.find((e) => e.category.id === cat.id);
            const spent = expenseItem ? expenseItem.amount : 0;
            const budget = cat.budget || 0;
            const percentage = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
            const isOver = spent > budget && budget > 0;
            const isWarning = percentage >= 80 && !isOver;

            return (
              <div
                key={cat.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Потрачено: {formatMoney(spent, currencySymbol)}
                      </p>
                    </div>
                  </div>

                  {editingBudgetId === cat.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        className="w-24 p-1.5 bg-slate-100 dark:bg-slate-800 border rounded text-xs font-bold text-slate-900 dark:text-white outline-none"
                      />
                      <button
                        onClick={() => handleSaveBudget(cat.id)}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditBudget(cat)}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      Лимит: {budget > 0 ? formatMoney(budget, currencySymbol) : "Указать"}
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>

                {budget > 0 && (
                  <>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          isOver ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.round((spent / budget) * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Осталось:{" "}
                        <strong className={isOver ? "text-rose-500" : "text-slate-700 dark:text-slate-200"}>
                          {formatMoney(budget - spent, currencySymbol)}
                        </strong>
                      </span>

                      {isOver ? (
                        <span className="text-rose-500 font-bold flex items-center gap-1">
                          <AlertTriangle size={13} /> Превышение на {formatMoney(spent - budget, currencySymbol)}
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-500 font-semibold flex items-center gap-1">
                          <AlertTriangle size={13} /> Использовано {percentage}%
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-medium flex items-center gap-1">
                          <CheckCircle2 size={13} /> В пределах нормы ({percentage}%)
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Savings Goals (Копилки) */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PiggyBank size={22} className="text-purple-600" /> Финансовые Цели и Копилки
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Копите на отпуск, крупные покупки и подушку безопасности
            </p>
          </div>

          <button
            onClick={() => handleOpenGoalModal()}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 self-start sm:self-auto transition-all"
          >
            <Plus size={18} /> Новая цель
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            return (
              <div
                key={goal.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-900 dark:text-white">{goal.title}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenGoalModal(goal)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDeleteGoal(goal.id)} className="p-1 text-slate-400 hover:text-rose-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {goal.note && <p className="text-xs text-slate-500 dark:text-slate-400">{goal.note}</p>}

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">
                        {formatMoney(goal.currentAmount, currencySymbol)}
                      </span>
                      <span className="text-slate-400">из {formatMoney(goal.targetAmount, currencySymbol)}</span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-purple-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                      <span>Прогресс: {pct}%</span>
                      {goal.deadline && <span>Срок: {goal.deadline}</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDepositGoal(goal);
                    setDepositAmount("");
                  }}
                  className="w-full py-2.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  <Plus size={16} /> Пополнить копилку
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Add/Edit Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingGoal ? "Редактировать цель" : "Новая финансовая цель"}
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGoalSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Название цели</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Отпуск на море"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Целевая сумма ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  placeholder="500000"
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Желаемый срок (дата)</label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Заметка</label>
                <input
                  type="text"
                  placeholder="Дополнительные детали"
                  value={goalNote}
                  onChange={(e) => setGoalNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-semibold"
                >
                  Отмена
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl">
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit to Goal Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Пополнить копилку "{depositGoal.title}"
              </h3>
              <button onClick={() => setDepositGoal(null)} className="text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Сумма пополнения ({currencySymbol})
                </label>
                <input
                  type="number"
                  required
                  placeholder="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Списать со счета</label>
                <select
                  value={depositAccountId}
                  onChange={(e) => setDepositAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatMoney(acc.balance, currencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="flex-1 py-2.5 border rounded-xl font-semibold"
                >
                  Отмена
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-xl">
                  Пополнить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
