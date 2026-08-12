import React from "react";
import {
  Wallet,
  PieChart,
  List,
  Target,
  Sparkles,
  Sun,
  Moon,
  Plus,
  Download,
  DollarSign,
} from "lucide-react";
import { DEFAULT_CURRENCIES } from "../data/initialData";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: string;
  setCurrency: (c: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  totalBalanceFormatted: string;
  onOpenNewTxModal: () => void;
  onOpenAIPromptModal: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  isDarkMode,
  setIsDarkMode,
  totalBalanceFormatted,
  onOpenNewTxModal,
  onOpenAIPromptModal,
  onOpenExportModal,
}) => {
  const tabs = [
    { id: "overview", label: "Обзор", icon: Wallet },
    { id: "transactions", label: "Операции", icon: List },
    { id: "analytics", label: "Аналитика", icon: PieChart },
    { id: "budgets", label: "Бюджет и Цели", icon: Target },
    { id: "ai", label: "ИИ-Ассистент", icon: Sparkles, badge: "AI" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & Total Balance */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold">
                <Wallet size={20} />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight hidden sm:inline">
                Учет<span className="text-blue-600 dark:text-blue-400">Финансов</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Баланс:</span>
              <span className="font-bold text-slate-900 dark:text-white">{totalBalanceFormatted}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-bold rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick AI prompt button */}
            <button
              onClick={onOpenAIPromptModal}
              title="ИИ Быстрый ввод"
              className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold"
            >
              <Sparkles size={16} />
              <span className="hidden lg:inline">ИИ Ввод</span>
            </button>

            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none rounded-xl text-xs font-semibold outline-none cursor-pointer"
            >
              {DEFAULT_CURRENCIES.map((c) => (
                <option key={c.code} value={c.symbol}>
                  {c.symbol} ({c.code})
                </option>
              ))}
            </select>

            {/* Export / Backup */}
            <button
              onClick={onOpenExportModal}
              title="Экспорт / Бэкап"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Download size={18} />
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Тема"
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Add Transaction primary button */}
            <button
              onClick={onOpenNewTxModal}
              className="py-2 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Запись</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
