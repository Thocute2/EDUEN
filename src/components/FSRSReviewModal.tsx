"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  RotateCw,
  Volume2,
  CheckCircle2,
  Trophy,
  Sparkles,
  Flame,
  ArrowRight,
  Brain,
  Calendar,
} from "lucide-react";
import { Rating } from "ts-fsrs";
import { FSRSFlashcard, recordCardReview, getDueFSRSFlashcards, getFSRSFlashcards } from "@/lib/storage";
import { getCardIntervalPreviews, getFSRSStateInfo, FSRSRating } from "@/lib/fsrs";
import { speechService } from "@/lib/speech";
import { Button } from "@/components/ui/button";
import { getPartOfSpeechInfo } from "@/lib/utils";

interface FSRSReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWord?: string; // Optional: review a single specific card
  onSessionUpdated?: () => void;
}

export const FSRSReviewModal: React.FC<FSRSReviewModalProps> = ({
  isOpen,
  onClose,
  targetWord,
  onSessionUpdated,
}) => {
  const [cards, setCards] = useState<FSRSFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewHistory, setReviewHistory] = useState<{ word: string; rating: FSRSRating }[]>([]);

  // Load review queue
  useEffect(() => {
    if (!isOpen) return;

    if (targetWord) {
      const all = getFSRSFlashcards();
      const specific = all.filter((c) => c.word.toLowerCase() === targetWord.toLowerCase());
      setCards(specific.length > 0 ? specific : all.slice(0, 1));
    } else {
      const dueCards = getDueFSRSFlashcards();
      if (dueCards.length > 0) {
        setCards(dueCards);
      } else {
        // If no cards are strictly due, allow reviewing all saved cards
        setCards(getFSRSFlashcards());
      }
    }

    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setReviewHistory([]);
  }, [isOpen, targetWord]);

  const currentCard = cards[currentIndex] || null;

  // Next interval previews for the current card
  const intervalPreviews = useMemo(() => {
    if (!currentCard) return null;
    return getCardIntervalPreviews(currentCard.card);
  }, [currentCard]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentCard) {
      speechService.play(currentCard.word, currentCard.audioUrl);
    }
  };

  const handleGrade = useCallback(
    (rating: FSRSRating) => {
      if (!currentCard) return;

      // Update in storage using FSRS algorithm
      recordCardReview(currentCard.word, rating);

      setReviewHistory((prev) => [...prev, { word: currentCard.word, rating }]);

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setIsCompleted(true);
        if (onSessionUpdated) onSessionUpdated();
      }
    },
    [currentCard, currentIndex, cards.length, onSessionUpdated]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (isCompleted) return;

      if (!isFlipped) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleFlip();
        }
      } else {
        if (e.key === "1") handleGrade(Rating.Again);
        else if (e.key === "2") handleGrade(Rating.Hard);
        else if (e.key === "3") handleGrade(Rating.Good);
        else if (e.key === "4") handleGrade(Rating.Easy);
        else if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleGrade(Rating.Good); // Default to Good on Enter/Space
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFlipped, isCompleted, handleFlip, handleGrade, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-50 duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Ôn Tập Thuật Toán ts-fsrs</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  FSRS-6
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && cards.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Thẻ {currentIndex + 1} / {cards.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto flex flex-col justify-center">
          {cards.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Chưa có thẻ ghi nhớ nào
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Hãy tra cứu từ vựng và bấm &ldquo;Tạo thẻ ghi nhớ FSRS&rdquo; trên thẻ từ để bắt đầu luyện tập lặp lại ngắt quãng.
              </p>
              <Button onClick={onClose} className="mt-4 rounded-xl">
                Quay lại tra từ
              </Button>
            </div>
          ) : isCompleted ? (
            /* Completion Screen */
            <div className="text-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Hoàn Thành Xuất Sắc!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Bạn đã hoàn thành phiên ôn tập {cards.length} thẻ theo chu kỳ FSRS.
                </p>
              </div>

              {/* Session Summary Cards */}
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-left">
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                    Thẻ Đã Ôn
                  </span>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {reviewHistory.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                    Thuật toán
                  </span>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ts-fsrs v6
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <Button
                  onClick={onClose}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 h-11 font-medium shadow-md shadow-indigo-500/20"
                >
                  Xong phiên học
                </Button>
              </div>
            </div>
          ) : (
            /* Active Card Review */
            currentCard && (
              <div className="space-y-6">
                {/* State & Due Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const stateInfo = getFSRSStateInfo(currentCard.card.state);
                      const posInfo = currentCard.partOfSpeech
                        ? getPartOfSpeechInfo(currentCard.partOfSpeech)
                        : null;

                      return (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${stateInfo.badgeClass}`}
                          >
                            {stateInfo.label}
                          </span>
                          {posInfo && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${posInfo.badgeClass}`}>
                              {posInfo.vi} ({posInfo.abbr})
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Lần ôn: {currentCard.card.reps}</span>
                  </div>
                </div>

                {/* Flashcard Box */}
                <div
                  onClick={handleFlip}
                  className="relative min-h-[240px] p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50 to-indigo-50/30 dark:from-slate-800/80 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700 shadow-lg cursor-pointer transition-all hover:border-indigo-400 flex flex-col justify-between group"
                >
                  {/* Front View */}
                  {!isFlipped ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 my-auto">
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                        {currentCard.word}
                      </h1>

                      {currentCard.phonetic && (
                        <p className="text-sm font-mono text-slate-400">
                          {currentCard.phonetic}
                        </p>
                      )}

                      <button
                        onClick={handlePlayAudio}
                        className="p-3 rounded-full bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:scale-110 shadow-sm transition-all cursor-pointer"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Bấm vào thẻ hoặc phím <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">Space</kbd> để lật đáp án
                      </p>
                    </div>
                  ) : (
                    /* Back View */
                    <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in-50 duration-200">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                            {currentCard.word}
                          </h2>
                          <button
                            onClick={handlePlayAudio}
                            className="p-2 rounded-full bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:scale-105 shadow-sm transition-all cursor-pointer"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Vietnamese nuance/meaning if available */}
                        {currentCard.meaningVi && (
                          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-xs sm:text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
                            {currentCard.meaningVi}
                          </div>
                        )}

                        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                          {currentCard.definition}
                        </p>

                        {currentCard.example && (
                          <div className="mt-3 pl-3 border-l-2 border-indigo-400/80 dark:border-indigo-500">
                            <p className="text-xs sm:text-sm italic text-slate-500 dark:text-slate-400">
                              &ldquo;{currentCard.example}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flip Action Indicator */}
                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center gap-1.5 text-xs text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isFlipped ? "Bấm để xem lại mặt trước" : "Lật thẻ xem đáp án"}</span>
                  </div>
                </div>

                {/* Rating Bar (Visible only when flipped) */}
                {isFlipped && intervalPreviews && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-3 duration-200">
                    <p className="text-xs text-center font-medium text-slate-500 dark:text-slate-400">
                      Bạn nhớ từ này như thế nào? (Chọn 1 - 4 hoặc bấm phím tắt)
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      {/* Rating 1: Again */}
                      <button
                        onClick={() => handleGrade(Rating.Again)}
                        className="p-2.5 sm:p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-center transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <span className="block text-[10px] font-mono text-rose-500">
                          {intervalPreviews[Rating.Again].intervalText}
                        </span>
                        <span className="block text-xs sm:text-sm font-bold mt-0.5">
                          Quên [1]
                        </span>
                      </button>

                      {/* Rating 2: Hard */}
                      <button
                        onClick={() => handleGrade(Rating.Hard)}
                        className="p-2.5 sm:p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300 text-center transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <span className="block text-[10px] font-mono text-amber-500">
                          {intervalPreviews[Rating.Hard].intervalText}
                        </span>
                        <span className="block text-xs sm:text-sm font-bold mt-0.5">
                          Khó [2]
                        </span>
                      </button>

                      {/* Rating 3: Good */}
                      <button
                        onClick={() => handleGrade(Rating.Good)}
                        className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-center transition-all cursor-pointer hover:scale-[1.02] shadow-sm"
                      >
                        <span className="block text-[10px] font-mono text-emerald-500">
                          {intervalPreviews[Rating.Good].intervalText}
                        </span>
                        <span className="block text-xs sm:text-sm font-bold mt-0.5">
                          Nhớ [3]
                        </span>
                      </button>

                      {/* Rating 4: Easy */}
                      <button
                        onClick={() => handleGrade(Rating.Easy)}
                        className="p-2.5 sm:p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-center transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <span className="block text-[10px] font-mono text-indigo-500">
                          {intervalPreviews[Rating.Easy].intervalText}
                        </span>
                        <span className="block text-xs sm:text-sm font-bold mt-0.5">
                          Dễ [4]
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
