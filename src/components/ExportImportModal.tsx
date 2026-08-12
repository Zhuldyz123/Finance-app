import React, { useRef } from "react";
import { X, Download, Upload, FileSpreadsheet, Database } from "lucide-react";
import { Account, Category, Goal, Transaction } from "../types";

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: Goal[];
  onImportData: (data: {
    transactions?: Transaction[];
    categories?: Category[];
    accounts?: Account[];
    goals?: Goal[];
  }) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  accounts,
  goals,
  onImportData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const exportJSON = () => {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      transactions,
      categories,
      accounts,
      goals,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ["ID", "Тип", "Сумма", "Категория", "Счет", "Дата", "Заметка", "Теги"];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || t.categoryId;
      const acc = accounts.find((a) => a.id === t.accountId)?.name || t.accountId;
      return [
        t.id,
        t.type,
        t.amount,
        `"${cat}"`,
        `"${acc}"`,
        t.date,
        `"${(t.note || "").replace(/"/g, '""')}"`,
        `"${(t.tags || []).join(", ")}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.transactions || json.accounts || json.categories) {
          if (confirm("Вы уверены, что хотите восстановить данные из резервной копии?")) {
            onImportData(json);
            alert("Данные успешно импортированы!");
            onClose();
          }
        } else {
          alert("Неверный формат резервного файла JSON");
        }
      } catch (err) {
        alert("Ошибка при чтении файла JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Экспорт / Резервное копирование</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={exportCSV}
            className="w-full p-4 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl flex items-center gap-3 text-left hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group"
          >
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">Экспорт в Excel / CSV</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Скачать список транзакций в таблицы</p>
            </div>
            <Download size={18} className="ml-auto text-slate-400" />
          </button>

          <button
            onClick={exportJSON}
            className="w-full p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl flex items-center gap-3 text-left hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
          >
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-105 transition-transform">
              <Database size={22} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">Создать бэкап (JSON)</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Сохранить все транзакции, счета и категории</p>
            </div>
            <Download size={18} className="ml-auto text-slate-400" />
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-xl flex items-center gap-3 text-left hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-all group"
            >
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-105 transition-transform">
                <Upload size={22} />
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white text-sm">Восстановить из файла JSON</div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Загрузить резервную копию базы данных</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
