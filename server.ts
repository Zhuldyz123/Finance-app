import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Helper to initialize Gemini SDK on server-side
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Parse natural language text into structured transaction
  app.post("/api/ai/parse-transaction", async (req, res) => {
    try {
      const { text, categories, accounts } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text prompt is required" });
      }

      const ai = getGeminiClient();

      const categoryNames = Array.isArray(categories) ? categories.join(", ") : "Продукты, Транспорт, Жилье, Развлечения, Здоровье, Зарплата, Фриланс";
      const accountNames = Array.isArray(accounts) ? accounts.join(", ") : "Карта, Наличные, Сбережения";

      const prompt = `Проанализируй следующий текст расходов/доходов пользователя: "${text}".
Доступные категории: [${categoryNames}].
Доступные счета: [${accountNames}].
Сегодняшняя дата: ${new Date().toISOString().split("T")[0]}.

Извлеки данные в строго соответствие со схемой:
- type: 'expense' (расход), 'income' (доход) или 'transfer' (перевод)
- amount: числовая сумма (положительное число)
- categoryName: наиболее подходящее название категории из доступных или создай подходящую короткую категорию
- accountName: подходящий счет из доступных или "Основная карта"
- note: краткое описание транзакции
- date: дата в формате YYYY-MM-DD (если дата указана "вчера", вычисли относительно сегодняшней)
- tags: массив ключевых тегов (например, ["такси", "яндекс"])
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: "expense, income, or transfer" },
              amount: { type: Type.NUMBER, description: "amount as positive number" },
              categoryName: { type: Type.STRING, description: "category name" },
              accountName: { type: Type.STRING, description: "account name" },
              note: { type: Type.STRING, description: "short note" },
              date: { type: Type.STRING, description: "YYYY-MM-DD date string" },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "tags",
              },
            },
            required: ["type", "amount", "categoryName", "note"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, result: parsed });
    } catch (error: any) {
      console.error("AI parse transaction error:", error);
      res.status(500).json({ error: error.message || "Failed to parse transaction" });
    }
  });

  // API Route: Generate comprehensive financial health & advice report
  app.post("/api/ai/analyze-finances", async (req, res) => {
    try {
      const { incomeTotal, expenseTotal, savingsRate, categoryExpenses, budgets, currency } = req.body;

      const ai = getGeminiClient();

      const prompt = `Ты профессиональный независимый финансовый аналитик и советник.
Проанализируй финансовую ситуацию пользователя за текущий месяц:
- Общий доход: ${incomeTotal} ${currency || "₸"}
- Общий расход: ${expenseTotal} ${currency || "₸"}
- Норма сбережений (Savings Rate): ${savingsRate}%
- Расходы по категориям: ${JSON.stringify(categoryExpenses)}
- Бюджеты: ${JSON.stringify(budgets)}

Дай структурированный анализ и рекомендации на русском языке:
1. Краткий вердикт по финансовому здоровью (healthStatus: 'excellent' | 'good' | 'warning' | 'critical', title, score от 0 до 100, summary).
2. 3 конкретных главных совета по оптимизации бюджета и экономии (tips: array of { title, category, potentialSaving, text }).
3. Оценка рисков перерасхода (risks: string[]).
4. Похвала за хорошую финансовую дисциплину, если есть (praises: string[]).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              healthStatus: { type: Type.STRING },
              score: { type: Type.NUMBER },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              tips: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    category: { type: Type.STRING },
                    potentialSaving: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                },
              },
              risks: { type: Type.ARRAY, items: { type: Type.STRING } },
              praises: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["healthStatus", "score", "title", "summary", "tips"],
          },
        },
      });

      const analysis = JSON.parse(response.text || "{}");
      res.json({ success: true, analysis });
    } catch (error: any) {
      console.error("AI analyze finances error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze finances" });
    }
  });

  // API Route: Financial Assistant Chat
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, financialContext } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `Ты - опытный финансовый помощник в приложении "Учет Финансов". Твоя цель - давать практичные, вежливые и разумные советы по управлению личным бюджетом, накоплениям, оптимизации трат и инвестициям.
Контекст пользователя:
- Баланс: ${financialContext?.totalBalance || 0}
- Доходы за месяц: ${financialContext?.incomeMonth || 0}
- Расходы за месяц: ${financialContext?.expenseMonth || 0}
- Валюта: ${financialContext?.currency || "₸"}
Отвечай четко, доброжелательно, поддерживай формат markdown (выделение жирным, списки).
`;

      const contents = (messages || []).map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
        },
      });

      res.json({ success: true, reply: response.text });
    } catch (error: any) {
      console.error("AI chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate chat response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
