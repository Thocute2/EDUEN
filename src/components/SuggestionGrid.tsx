"use client";

import React from "react";
import { WordSuggestion } from "@/types/dictionary";
import { Sparkles, ArrowRight, BookOpen, Layers, CheckCircle2 } from "lucide-react";

interface SuggestionGridProps {
  query: string;
  suggestions: WordSuggestion[];
  onSelectWord: (word: string) => void;
  isLoading?: boolean;
}

export const SuggestionGrid: React.FC<SuggestionGridProps> = ({
  query,
  suggestions,
  onSelectWord,
  isLoading = false,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/80 dark:from-slate-900/90 dark:via-slate-900 dark:to-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/50 shadow-xl shadow-indigo-100/30 dark:shadow-none animate-in fade-in-50 duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-indigo-100/60 dark:border-indigo-900/40">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Bóc tách & Gợi ý từ khóa tiếng Anh</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tìm kiếm:</span>
            <span className="text-indigo-600 dark:text-indigo-400 italic">
              &ldquo;{query}&rdquo;
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chọn từ tiếng Anh phù hợp nhất với ngữ cảnh công việc của bạn để xem định nghĩa và kịch bản thực tế:
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
            {suggestions.length} gợi ý
          </span>
        </div>
      </div>

      {/* Grid of suggestion cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-6">
        {suggestions.map((item, index) => {
          const isPrimary = item.type === "primary" || index === 0;

          return (
            <div
              key={`${item.word}-${index}`}
              onClick={() => onSelectWord(item.word)}
              className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isPrimary
                  ? "bg-white dark:bg-slate-800/90 border-indigo-300 dark:border-indigo-700 shadow-md shadow-indigo-100/50 dark:shadow-none hover:border-indigo-500 hover:scale-[1.01]"
                  : "bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.01]"
              }`}
            >
              <div>
                {/* Header row of card: Word + POS + Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.word}
                    </span>
                    {item.pos && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.pos}
                      </span>
                    )}
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isPrimary
                          ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                          : "bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Meaning in Vietnamese */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-4">
                  {item.meaningVi}
                </p>
              </div>

              {/* Action link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Học từ này
                </span>
                <ArrowRight className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
