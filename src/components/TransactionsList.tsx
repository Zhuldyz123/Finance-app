import React, { useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Copy,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Download,
  Calendar,
  X,
} from "lucide-react";
import { Account, Category, Transaction, TransactionType } from "../types";
import { formatDateRussian, formatMoney } from "../utils/formatters";
import { CategoryIcon } from "./CategoryIcon";

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currencySymbol: string;
  onOpenNewTxModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDuplicateTransaction: (tx: Transaction) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  categories,
  accounts,
  currencySymbol,
  onOpenNewTxModal,
  onEditTransaction,
  onDeleteTransaction,
  onDuplicateTransaction,
}) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");

  // Filtering
  const filteredTransactions = transactions
    .filter((tx) => {
      // Type filter
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      // Category filter
      if (categoryFilter !== "all" && tx.categoryId !== categoryFilter) return false;
      // Account filter
      if (accountFilter !== "all" && tx.accountId !== accountFilter && tx.targetAccountId !== accountFilter)
        return false;

      // Search text
      if (search.trim()) {
        const query = search.toLowerCase();
        const cat = categories.find((c) => c.id === tx.categoryId)?.name || "";
        const acc = accounts.find((a) => a.id === tx.accountId)?.name || "";
        const note = tx.note || "";
        const tags = (tx.tags || []).join(" ");
        const amountStr = tx.amount.toString();

        return (
          cat.toLowerCase().includes(query) ||
          acc.toLowerCase().includes(query) ||
          note.toLowerCase().includes(query) ||
          tags.toLowerCase().includes(query) ||
          amountStr.includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date-asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setAccountFilter("all");
    setSortBy("date-desc");
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Операции и История</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Всего найдено записей: {filteredTransactions.length} из {transactions.length}
          </p>
        </div>

        <button
          onClick={onOpenNewTxModal}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 self-start md:self-auto transition-all"
        >
          <Plus size={18} /> Новая транзакция
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Поиск по названию, тегу, сумме..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все типы</option>
            <option value="expense">Расходы</option>
            <option value="income">Доходы</option>
            <option value="transfer">Переводы</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все счета</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort & Reset row */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Сортировка:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
            >
              <option value="date-desc">Сначала новые</option>
              <option value="date-asc">Сначала старые</option>
              <option value="amount-desc">Сначала крупные суммы</option>
              <option value="amount-asc">Сначала мелкие суммы</option>
            </select>
          </div>

          {(search || typeFilter !== "all" || categoryFilter !== "all" || accountFilter !== "all") && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Операции не найдены</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Попробуйте изменить параметры поиска или добавить новую финансовую операцию.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const acc = accounts.find((a) => a.id === tx.accountId);
              const targetAcc = tx.targetAccountId ? accounts.find((a) => a.id === tx.targetAccountId) : null;

              const isIncome = tx.type === "income";
              const isTransfer = tx.type === "transfer";

              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: cat?.color || "#64748b" }}
                    >
                      <CategoryIcon name={cat?.icon || "CircleDollarSign"} size={20} />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {tx.note || cat?.name || "Операция"}
                        </span>
                        {tx.isRecurring && (
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] font-semibold rounded">
                            Регулярно
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {cat?.name || "Категория"}
                        </span>
                        <span>•</span>
                        <span>
                          {acc?.name || "Счет"}
                          {isTransfer && targetAcc ? ` ➔ ${targetAcc.name}` : ""}
                        </span>
                        <span>•</span>
                        <span>{formatDateRussian(tx.date)}</span>
                      </div>

                      {/* Tags */}
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tx.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded-md font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <div
                      className={`text-base font-extrabold ${
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

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onDuplicateTransaction(tx)}
                        title="Дублировать"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => onEditTransaction(tx)}
                        title="Редактировать"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Удалить эту операцию?")) {
                            onDeleteTransaction(tx.id);
                          }
                        }}
                        title="Удалить"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
