import React, { useState } from "react";
import { X, Sparkles, Check, AlertCircle, Loader2 } from "lucide-react";
import { Account, Category, Transaction } from "../types";

interface QuickAIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, "id">) => void;
  categories: Category[];
  accounts: Account[];
  currencySymbol: string;
}

export const QuickAIPromptModal: React.FC<QuickAIPromptModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  categories,
  accounts,
  currencySymbol,
}) => {
  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    "Купил продукты в Магнуме на 12500 вчера с карты",
    "Заправил машину АИ-95 на 15000 наличными",
    "Получил аванс за фриланс 85000 тенге",
    "Оплатил коммунальные услуги 45000 тенге",
  ];

  const handleParse = async () => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const response = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: promptText,
          categories: categories.map((c) => c.name),
          accounts: accounts.map((a) => a.name),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Не удалось распознать запись");
      }

      const res = data.result;
      // Match category ID
      const matchedCat = categories.find(
        (c) =>
          c.name.toLowerCase().includes(res.categoryName?.toLowerCase() || "") ||
          (res.categoryName && c.name.toLowerCase().startsWith(res.categoryName.toLowerCase()))
      ) || categories[0];

      // Match account ID
      const matchedAcc = accounts.find((a) =>
        a.name.toLowerCase().includes(res.accountName?.toLowerCase() || "")
      ) || accounts[0];

      setParsedData({
        type: res.type || "expense",
        amount: res.amount || 0,
        categoryId: matchedCat.id,
        categoryName: matchedCat.name,
        accountId: matchedAcc.id,
        accountName: matchedAcc.name,
        date: res.date || new Date().toISOString().split("T")[0],
        note: res.note || promptText,
        tags: res.tags || [],
      });
    } catch (err: any) {
      setError(err.message || "Ошибка распознавания текста");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedData) return;

    onAddTransaction({
      type: parsedData.type,
      amount: parsedData.amount,
      categoryId: parsedData.categoryId,
      accountId: parsedData.accountId,
      date: parsedData.date,
      note: parsedData.note,
      tags: parsedData.tags,
    });

    onClose();
    setPromptText("");
    setParsedData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-xl shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">ИИ-Быстрый ввод</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Напишите операцию простыми словами</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <textarea
              rows={3}
              placeholder="Например: Вчера потратил 18500 на заправку бензином с карты"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Prompt suggestions */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Примеры для быстрого клика:</p>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setPromptText(sample)}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 text-xs rounded-lg transition-colors border border-slate-200/60 dark:border-slate-700/60"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Result preview */}
          {parsedData && (
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-xl space-y-2">
              <p className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Распознано ИИ:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-400">Тип:</span>{" "}
                  <strong className="font-semibold">{parsedData.type === "expense" ? "Расход" : "Доход"}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Сумма:</span>{" "}
                  <strong className="font-bold text-slate-900 dark:text-white">
                    {parsedData.amount} {currencySymbol}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400">Категория:</span>{" "}
                  <strong className="font-semibold">{parsedData.categoryName}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Счет:</span>{" "}
                  <strong className="font-semibold">{parsedData.accountName}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400">Описание:</span> {parsedData.note}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            {!parsedData ? (
              <button
                type="button"
                disabled={isLoading || !promptText.trim()}
                onClick={handleParse}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Распознаем через Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Распознать запись
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setParsedData(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
                >
                  <Check size={18} />
                  Сохранить в базу
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
