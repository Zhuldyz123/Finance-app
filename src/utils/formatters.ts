import { Category, Transaction } from "../types";

export const formatMoney = (amount: number, currencySymbol: string = "₸"): string => {
  if (isNaN(amount)) return `0 ${currencySymbol}`;
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("ru-RU").format(Math.abs(rounded));
  return `${amount < 0 ? "-" : ""}${formatted} ${currencySymbol}`;
};

export const formatDateRussian = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getMonthYearString = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const calculateTotals = (transactions: Transaction[]) => {
  let income = 0;
  let expense = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") {
      income += tx.amount;
    } else if (tx.type === "expense") {
      expense += tx.amount;
    }
  });

  const net = income - expense;
  const savingsRate = income > 0 ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0;

  return { income, expense, net, savingsRate };
};

export const calculateCategoryExpenses = (transactions: Transaction[], categories: Category[]) => {
  const catMap = new Map<string, { category: Category; amount: number; count: number }>();

  categories.forEach((c) => {
    catMap.set(c.id, { category: c, amount: 0, count: 0 });
  });

  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === "expense") {
      totalExpense += tx.amount;
      const existing = catMap.get(tx.categoryId);
      if (existing) {
        existing.amount += tx.amount;
        existing.count += 1;
      }
    }
  });

  return Array.from(catMap.values())
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      percentage: totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0,
    }));
};
