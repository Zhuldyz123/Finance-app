import React, { useState, useEffect } from "react";
import { X, Plus, Sparkles, Calendar, Tag, ArrowRight } from "lucide-react";
import { Account, Category, Transaction, TransactionType } from "../types";
import { CategoryIcon } from "./CategoryIcon";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, "id">, editId?: string) => void;
  categories: Category[];
  accounts: Account[];
  initialTransaction?: Transaction | null;
  currencySymbol: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  accounts,
  initialTransaction,
  currencySymbol,
}) => {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [targetAccountId, setTargetAccountId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCategoryId(initialTransaction.categoryId);
      setAccountId(initialTransaction.accountId);
      setTargetAccountId(initialTransaction.targetAccountId || "");
      setDate(initialTransaction.date);
      setNote(initialTransaction.note || "");
      setTags(initialTransaction.tags || []);
      setIsRecurring(!!initialTransaction.isRecurring);
    } else {
      setType("expense");
      setAmount("");
      const defaultCat = categories.find((c) => c.type === "expense" || c.type === "both");
      setCategoryId(defaultCat ? defaultCat.id : categories[0]?.id || "");
      setAccountId(accounts[0]?.id || "");
      setTargetAccountId(accounts[1]?.id || "");
      setDate(new Date().toISOString().split("T")[0]);
      setNote("");
      setTags([]);
      setIsRecurring(false);
    }
  }, [initialTransaction, isOpen, categories, accounts]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (c) => c.type === type || c.type === "both"
  );

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Пожалуйста, введите корректную сумму");
      return;
    }
    if (!accountId) {
      alert("Выберите счет");
      return;
    }
    if (type === "transfer" && (!targetAccountId || targetAccountId === accountId)) {
      alert("Выберите другой счет назначения для перевода");
      return;
    }

    onSave(
      {
        type,
        amount: parsedAmount,
        categoryId: type === "transfer" ? "cat_transfer" : categoryId,
        accountId,
        targetAccountId: type === "transfer" ? targetAccountId : undefined,
        date,
        note,
        tags,
        isRecurring,
      },
      initialTransaction?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {initialTransaction ? "Редактировать операцию" : "Новая операция"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transaction Type Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                const cat = categories.find((c) => c.type === "expense");
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-2 px-3 rounded-lg transition-all text-center ${
                type === "expense"
                  ? "bg-red-500 text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              - Расход
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                const cat = categories.find((c) => c.type === "income");
                if (cat) setCategoryId(cat.id);
              }}
              className={`py-2 px-3 rounded-lg transition-all text-center ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              + Доход
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={`py-2 px-3 rounded-lg transition-all text-center ${
                type === "transfer"
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              🔄 Перевод
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Сумма ({currencySymbol})
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                {currencySymbol}
              </span>
            </div>
          </div>

          {/* Accounts selection */}
          {type === "transfer" ? (
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Со счета
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.balance} {currencySymbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  На счет
                </label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Счет / Кошелек
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Категория
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Дата
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Заметка / Описание
            </label>
            <input
              type="text"
              placeholder="Например: Покупка продуктов в Магнуме"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Теги
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Добавить тег..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
              >
                + Тег
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-red-500 text-slate-400 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all text-sm"
            >
              {initialTransaction ? "Сохранить изменения" : "Добавить транзакцию"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
