"use client";

import React, { useState, useEffect } from "react";
import {
  BookMarked,
  Sparkles,
  X,
  Trash2,
  Brain,
  Play,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FSRSFlashcard,
  getFSRSFlashcards,
  removeFSRSFlashcard,
  getFSRSStats,
} from "@/lib/storage";
import { getFSRSStateInfo, formatIntervalPreview, isCardDue } from "@/lib/fsrs";
import { State } from "ts-fsrs";

interface NavbarProps {
  onSelectWord: (word: string) => void;
  onOpenFSRSReview?: (targetWord?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectWord,
  onOpenFSRSReview,
}) => {
  const [cards, setCards] = useState<FSRSFlashcard[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "due" | "learning" | "mastered">("all");
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    newCards: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  });

  const refreshCards = () => {
    const list = getFSRSFlashcards();
    setCards(list);
    setStats(getFSRSStats());
  };

  useEffect(() => {
    refreshCards();
    const interval = setInterval(refreshCards, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRemoveCard = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    removeFSRSFlashcard(word);
    refreshCards();
  };

  const handleStartReview = (targetWord?: string) => {
    setIsDrawerOpen(false);
    if (onOpenFSRSReview) {
      onOpenFSRSReview(targetWord);
    }
  };

  // Filter cards based on active tab
  const filteredCards = cards.filter((c) => {
    if (filterTab === "due") return isCardDue(c.card);
    if (filterTab === "learning")
      return c.card.state === State.Learning || c.card.state === State.New;
    if (filterTab === "mastered") return c.card.stability >= 14;
    return true;
  });

  return (
    <>
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            onClick={() => onSelectWord("")}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                EDU<span className="text-indigo-600 dark:text-indigo-400">EN</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800">
                FSRS PRO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick FSRS Study Button */}
            {cards.length > 0 && onOpenFSRSReview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartReview()}
                className={`rounded-xl gap-1.5 font-medium transition-all ${
                  stats.due > 0
                    ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline text-xs">Ôn Tập FSRS</span>
                {stats.due > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                    {stats.due} đến hạn
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">({cards.length})</span>
                )}
              </Button>
            )}

            {/* Word Bank Drawer Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl gap-2 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
            >
              <BookMarked className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold">Word Bank</span>
              {cards.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  {cards.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Saved Words & FSRS Manager Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in-50">
          <div
            className="fixed inset-0"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    Kho Thẻ Ghi Nhớ FSRS
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Lên lịch ôn tập bằng thuật toán lặp lại ngắt quãng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick FSRS Review CTA if there are cards */}
            {cards.length > 0 && onOpenFSRSReview && (
              <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-900/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    Phiên ôn tập hôm nay
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {stats.due} thẻ đến hạn
                  </span>
                </div>
                <Button
                  onClick={() => handleStartReview()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-medium shadow-md shadow-indigo-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Bắt đầu ôn tập FSRS</span>
                </Button>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-xs font-medium">
              <button
                onClick={() => setFilterTab("all")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === "all"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Tất cả ({cards.length})
              </button>
              <button
                onClick={() => setFilterTab("due")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === "due"
                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Cần ôn ({stats.due})
              </button>
              <button
                onClick={() => setFilterTab("learning")}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  filterTab === "learning"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                }`}
              >
                Đang học ({stats.newCards + stats.learning})
              </button>
            </div>

            {/* Card List */}
            <div className="flex-1 overflow-y-auto py-1 space-y-2.5">
              {filteredCards.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium">Không có thẻ nào trong danh mục này.</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Tra cứu và bấm &ldquo;Tạo thẻ FSRS&rdquo; để thêm từ mới vào kho.
                  </p>
                </div>
              ) : (
                filteredCards.map((item) => {
                  const stateInfo = getFSRSStateInfo(item.card.state);
                  const isDue = isCardDue(item.card);

                  return (
                    <div
                      key={item.word}
                      onClick={() => {
                        onSelectWord(item.word);
                        setIsDrawerOpen(false);
                      }}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-base capitalize text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {item.word}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stateInfo.badgeClass}`}>
                            {stateInfo.label}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {item.definition}
                        </p>

                        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            {isDue ? (
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                Cần ôn ngay
                              </span>
                            ) : (
                              <span>Ôn: {formatIntervalPreview(item.card.due)}</span>
                            )}
                          </span>
                          <span>Ôn {item.card.reps} lần</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {onOpenFSRSReview && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartReview(item.word);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-slate-700 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-colors shadow-xs"
                            title="Ôn tập riêng thẻ này"
                          >
                            <Brain className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleRemoveCard(e, item.word)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Xóa thẻ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 text-center flex items-center justify-between">
              <span>Chu kỳ thuật toán FSRS-6</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {stats.total} thẻ đã lưu
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
