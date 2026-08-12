import { Category } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: "cat_groceries", name: "Продукты и Еда", icon: "ShoppingCart", color: "#10b981", type: "expense", budget: 120000 },
  { id: "cat_transport", name: "Транспорт и Авто", icon: "Car", color: "#3b82f6", type: "expense", budget: 45000 },
  { id: "cat_housing", name: "Коммуналка и Дом", icon: "Home", color: "#8b5cf6", type: "expense", budget: 80000 },
  { id: "cat_dining", name: "Кафе и Рестораны", icon: "Utensils", color: "#f59e0b", type: "expense", budget: 35000 },
  { id: "cat_entertainment", name: "Развлечения и Отдых", icon: "Film", color: "#ec4899", type: "expense", budget: 30000 },
  { id: "cat_health", name: "Здоровье и Аптека", icon: "HeartPulse", color: "#ef4444", type: "expense", budget: 25000 },
  { id: "cat_shopping", name: "Одежда и Покупки", icon: "ShoppingBag", color: "#06b6d4", type: "expense", budget: 50000 },
  { id: "cat_subscriptions", name: "Связь и Подписки", icon: "Wifi", color: "#6366f1", type: "expense", budget: 15000 },
  { id: "cat_education", name: "Образование и Книги", icon: "GraduationCap", color: "#14b8a6", type: "expense", budget: 20000 },
  { id: "cat_travel", name: "Путешествия", icon: "Plane", color: "#f97316", type: "expense", budget: 100000 },
  { id: "cat_other_expense", name: "Прочие расходы", icon: "MoreHorizontal", color: "#6b7280", type: "expense", budget: 20000 },

  // Income categories
  { id: "cat_salary", name: "Зарплата", icon: "Briefcase", color: "#10b981", type: "income" },
  { id: "cat_freelance", name: "Фриланс и Проекты", icon: "Laptop", color: "#3b82f6", type: "income" },
  { id: "cat_investments", name: "Инвестиции и Дивиденды", icon: "TrendingUp", color: "#8b5cf6", type: "income" },
  { id: "cat_gifts", name: "Подарки и Кешбэк", icon: "Gift", color: "#ec4899", type: "income" },
  { id: "cat_other_income", name: "Прочие доходы", icon: "DollarSign", color: "#059669", type: "income" },

  // Transfer category
  { id: "cat_transfer", name: "Перевод между счетами", icon: "ArrowLeftRight", color: "#64748b", type: "both" },
];
