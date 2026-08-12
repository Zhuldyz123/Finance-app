import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Overview } from "./components/Overview";
import { TransactionsList } from "./components/TransactionsList";
import { Analytics } from "./components/Analytics";
import { BudgetsAndGoals } from "./components/BudgetsAndGoals";
import { AIAssistant } from "./components/AIAssistant";
import { TransactionModal } from "./components/TransactionModal";
import { QuickAIPromptModal } from "./components/QuickAIPromptModal";
import { ExportImportModal } from "./components/ExportImportModal";

import { Account, Category, Goal, Transaction } from "./types";
import { DEFAULT_CATEGORIES } from "./data/categories";
import { INITIAL_ACCOUNTS, INITIAL_GOALS, INITIAL_TRANSACTIONS } from "./data/initialData";
import { formatMoney } from "./utils/formatters";

export default function App() {
  // LocalStorage state initialization
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("finance_app_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("finance_app_categories");
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("finance_app_accounts");
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("finance_app_goals");
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem("finance_app_currency") || "₸";
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("finance_app_theme") === "dark";
  });

  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isAIPromptModalOpen, setIsAIPromptModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Sync dark mode class with <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("finance_app_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("finance_app_theme", "light");
    }
  }, [isDarkMode]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem("finance_app_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("finance_app_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("finance_app_accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("finance_app_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("finance_app_currency", currency);
  }, [currency]);

  // Handle Account Balance adjustments
  const applyTxBalanceChange = (
    tx: Omit<Transaction, "id">,
    revertMultiplier: number = 1
  ) => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        let newBalance = acc.balance;

        if (tx.type === "expense" && acc.id === tx.accountId) {
          newBalance -= tx.amount * revertMultiplier;
        } else if (tx.type === "income" && acc.id === tx.accountId) {
          newBalance += tx.amount * revertMultiplier;
        } else if (tx.type === "transfer") {
          if (acc.id === tx.accountId) {
            newBalance -= tx.amount * revertMultiplier;
          }
          if (acc.id === tx.targetAccountId) {
            newBalance += tx.amount * revertMultiplier;
          }
        }

        return { ...acc, balance: newBalance };
      })
    );
  };

  // Add or Edit Transaction
  const handleSaveTransaction = (txData: Omit<Transaction, "id">, editId?: string) => {
    if (editId) {
      // Revert previous transaction effect on account balance
      const existing = transactions.find((t) => t.id === editId);
      if (existing) {
        applyTxBalanceChange(existing, -1);
      }

      // Apply new transaction balance change
      applyTxBalanceChange(txData, 1);

      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? { ...txData, id: editId } : t))
      );
    } else {
      // New Transaction
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      };

      applyTxBalanceChange(txData, 1);
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const existing = transactions.find((t) => t.id === id);
    if (existing) {
      applyTxBalanceChange(existing, -1);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Duplicate Transaction
  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Omit<Transaction, "id"> = {
      type: tx.type,
      amount: tx.amount,
      categoryId: tx.categoryId,
      accountId: tx.accountId,
      targetAccountId: tx.targetAccountId,
      date: new Date().toISOString().split("T")[0],
      note: `${tx.note || "Копия"} (копия)`,
      tags: tx.tags ? [...tx.tags] : [],
      isRecurring: tx.isRecurring,
    };

    handleSaveTransaction(duplicated);
  };

  // Update Category Budget
  const handleUpdateCategoryBudget = (categoryId: string, newBudget: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, budget: newBudget } : c))
    );
  };

  // Save Goal
  const handleSaveGoal = (goalData: Omit<Goal, "id">, editId?: string) => {
    if (editId) {
      setGoals((prev) => prev.map((g) => (g.id === editId ? { ...goalData, id: editId } : g)));
    } else {
      const newGoal: Goal = {
        ...goalData,
        id: `goal_${Date.now()}`,
      };
      setGoals((prev) => [...prev, newGoal]);
    }
  };

  // Delete Goal
  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту финансовую цель?")) {
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    }
  };

  // Deposit to Goal
  const handleDepositToGoal = (goalId: string, amount: number, accountId: string) => {
    // Deduct from account balance
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, balance: a.balance - amount } : a))
    );

    // Add to goal currentAmount
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    // Record as transfer transaction
    const transferTx: Transaction = {
      id: `tx_goal_${Date.now()}`,
      type: "expense",
      amount,
      categoryId: "cat_transfer",
      accountId,
      date: new Date().toISOString().split("T")[0],
      note: `Пополнение копилки: ${goals.find((g) => g.id === goalId)?.title}`,
      tags: ["копилка"],
    };

    setTransactions((prev) => [transferTx, ...prev]);
  };

  // Restore imported backup
  const handleImportData = (data: {
    transactions?: Transaction[];
    categories?: Category[];
    accounts?: Account[];
    goals?: Goal[];
  }) => {
    if (data.transactions) setTransactions(data.transactions);
    if (data.categories) setCategories(data.categories);
    if (data.accounts) setAccounts(data.accounts);
    if (data.goals) setGoals(data.goals);
  };

  const totalBalanceFormatted = formatMoney(
    accounts.reduce((sum, a) => sum + a.balance, 0),
    currency
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        totalBalanceFormatted={totalBalanceFormatted}
        onOpenNewTxModal={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenAIPromptModal={() => setIsAIPromptModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === "overview" && (
          <Overview
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            goals={goals}
            currencySymbol={currency}
            onOpenNewTxModal={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onOpenAIPromptModal={() => setIsAIPromptModalOpen(true)}
            onNavigateTab={setActiveTab}
            onEditGoal={(g) => {
              setActiveTab("budgets");
            }}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsList
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            currencySymbol={currency}
            onOpenNewTxModal={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onDuplicateTransaction={handleDuplicateTransaction}
          />
        )}

        {activeTab === "analytics" && (
          <Analytics
            transactions={transactions}
            categories={categories}
            currencySymbol={currency}
          />
        )}

        {activeTab === "budgets" && (
          <BudgetsAndGoals
            categories={categories}
            transactions={transactions}
            accounts={accounts}
            goals={goals}
            currencySymbol={currency}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositToGoal={handleDepositToGoal}
          />
        )}

        {activeTab === "ai" && (
          <AIAssistant
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            currencySymbol={currency}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        categories={categories}
        accounts={accounts}
        initialTransaction={editingTx}
        currencySymbol={currency}
      />

      <QuickAIPromptModal
        isOpen={isAIPromptModalOpen}
        onClose={() => setIsAIPromptModalOpen(false)}
        onAddTransaction={handleSaveTransaction}
        categories={categories}
        accounts={accounts}
        currencySymbol={currency}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        goals={goals}
        onImportData={handleImportData}
      />
    </div>
  );
}
