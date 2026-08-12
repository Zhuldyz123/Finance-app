export type TransactionType = "expense" | "income" | "transfer";

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color name or hex
  type: "expense" | "income" | "both";
  budget?: number; // Monthly budget limit
}

export interface Account {
  id: string;
  name: string;
  type: "card" | "cash" | "savings" | "investment" | "business";
  balance: number;
  currency: string;
  icon: string;
  color: string;
  accountNumber?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  targetAccountId?: string; // required if type === 'transfer'
  date: string; // ISO format string YYYY-MM-DD or full ISO
  note: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringPeriod?: "daily" | "weekly" | "monthly" | "yearly";
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category: string;
  color: string;
  icon: string;
  note?: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface AITip {
  title: string;
  category: string;
  potentialSaving: string;
  text: string;
}

export interface AIAnalysis {
  healthStatus: "excellent" | "good" | "warning" | "critical";
  score: number;
  title: string;
  summary: string;
  tips: AITip[];
  risks?: string[];
  praises?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
