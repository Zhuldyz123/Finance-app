import React, { useState } from "react";
import {
  Sparkles,
  Bot,
  Send,
  Loader2,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Receipt,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { Account, AIAnalysis, Category, ChatMessage, Transaction } from "../types";
import { calculateCategoryExpenses, calculateTotals, formatMoney } from "../utils/formatters";

interface AIAssistantProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  currencySymbol: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  transactions,
  categories,
  accounts,
  currencySymbol,
}) => {
  const [activeTab, setActiveTab] = useState<"analysis" | "chat">("analysis");

  // Analysis state
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      role: "assistant",
      content:
        "Здравствуйте! Я ваш персональный ИИ-финансовый ассистент. Могу проанализировать ваши расходы, подсказать правила распределения бюджета (например, 50/30/20) или дать совет по экономии. Чем могу помочь?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  const { income, expense, savingsRate } = calculateTotals(transactions);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    const categoryExpenses = calculateCategoryExpenses(transactions, categories).map((c) => ({
      name: c.category.name,
      amount: c.amount,
      percentage: c.percentage,
    }));

    const budgets = categories
      .filter((c) => c.budget && c.budget > 0)
      .map((c) => ({ name: c.name, budget: c.budget }));

    try {
      const response = await fetch("/api/ai/analyze-finances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incomeTotal: income,
          expenseTotal: expense,
          savingsRate,
          categoryExpenses,
          budgets,
          currency: currencySymbol,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ошибка генерации ИИ-анализа");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setAnalysisError(err.message || "Произошла ошибка при анализе");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingChat) return;

    const userMsgText = inputMessage.trim();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          financialContext: {
            totalBalance,
            incomeMonth: income,
            expenseMonth: expense,
            currency: currencySymbol,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Ошибка получения ответа");
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Извините, произошла ошибка связи с нейросетью. Пожалуйста, попробуйте еще раз.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} /> ИИ-Финансовый Советник
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Персональный анализ трат и консультации на базе модели Gemini 3.6 Flash
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "analysis"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Lightbulb size={16} /> Анализ и Советы
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "chat"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <MessageSquare size={16} /> Финансовый Чат
          </button>
        </div>
      </div>

      {activeTab === "analysis" ? (
        <div className="space-y-6">
          {/* Action Callout */}
          <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 max-w-xl">
              <span className="px-2.5 py-1 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full text-[11px] font-bold uppercase tracking-wider">
                Интеллектуальный разбор
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Узнайте, как сэкономить до 20% бюджета в этом месяце
              </h3>
              <p className="text-xs text-slate-300">
                ИИ проанализирует структуру ваших доходов, регулярных расходов и категорий переплат, после чего предложит пошаговый план оптимизации.
              </p>
            </div>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="py-3.5 px-6 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm shrink-0 transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Анализируем данные...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Запустить ИИ-Анализ
                </>
              )}
            </button>
          </div>

          {analysisError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{analysisError}</span>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Score & Verdict Card */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400">ИИ-Вердикт</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{analysis.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Индекс здоровья</span>
                      <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {analysis.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>

              {/* Actionable Tips Grid */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb size={20} className="text-amber-500" /> Персональные рекомендации по экономии
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysis.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-2 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex justify-between items-start text-xs font-bold text-amber-600 dark:text-amber-400">
                        <span>Категория: {tip.category}</span>
                        {tip.potentialSaving && (
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 rounded-full">
                            Потенциал: {tip.potentialSaving}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tip.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks & Praises */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.risks && analysis.risks.length > 0 && (
                  <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl space-y-2">
                    <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle size={16} /> Риски перерасхода
                    </h4>
                    <ul className="list-disc list-inside text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      {analysis.risks.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.praises && analysis.praises.length > 0 && (
                  <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl space-y-2">
                    <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 size={16} /> Положительные стороны
                    </h4>
                    <ul className="list-disc list-inside text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                      {analysis.praises.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Financial Chat View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[550px]">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 text-xs font-bold ${
                      isUser
                        ? "bg-blue-600"
                        : "bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md"
                    }`}
                  >
                    {isUser ? "Вы" : <Bot size={18} />}
                  </div>

                  <div
                    className={`max-w-lg p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    {msg.content}
                    <div
                      className={`text-[10px] pt-1 text-right ${
                        isUser ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSendingChat && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Loader2 size={16} className="animate-spin text-purple-600" />
                ИИ финансовый советник печатает...
              </div>
            )}
          </div>

          {/* Chat Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2"
          >
            <input
              type="text"
              placeholder="Спросите об экономии, инвестициях или бюджетировании..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSendingChat}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs"
            >
              <Send size={16} />
              <span>Отправить</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
