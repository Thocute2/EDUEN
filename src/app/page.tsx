"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Flashcard } from "@/components/Flashcard";
import { SuggestionGrid } from "@/components/SuggestionGrid";
import { FSRSReviewModal } from "@/components/FSRSReviewModal";
import { SentenceTranslator } from "@/components/SentenceTranslator";
import { Navbar } from "@/components/Navbar";
import { fetchWordDefinition } from "@/lib/dictionary";
import { DictionaryEntry, WordSuggestion, SuggestionResponse } from "@/types/dictionary";
import { isWordSaved } from "@/lib/storage";
import { containsVietnameseDiacritics, findInVietnameseLexicon } from "@/lib/vietnameseLexicon";
import { AlertCircle, BookOpen, Languages, Sparkles, TrendingUp, Volume2 } from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"dictionary" | "translator">("dictionary");
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [suggestionQuery, setSuggestionQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchedWord, setSearchedWord] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [targetWordForReview, setTargetWordForReview] = useState<string | undefined>(undefined);

  const handleSearch = useCallback(async (word: string) => {
    const trimmed = word.trim();
    if (!trimmed) {
      setCurrentEntry(null);
      setSuggestions([]);
      setErrorMessage(null);
      setSearchedWord("");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSearchedWord(trimmed);

    // 1. Check if the searched term is Vietnamese
    const isVietnamese =
      containsVietnameseDiacritics(trimmed) || !!findInVietnameseLexicon(trimmed);

    if (isVietnamese) {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SuggestionResponse = await res.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
            setSuggestionQuery(trimmed);
            setCurrentEntry(null);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to dictionary search
      }
    }

    // 2. Otherwise perform standard English dictionary lookup
    setSuggestions([]);
    const result = await fetchWordDefinition(trimmed);

    setIsLoading(false);
    if (result.error) {
      // If English dictionary lookup failed, try to see if there are translation/synonym suggestions
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data: SuggestionResponse = await res.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
            setSuggestionQuery(trimmed);
            setCurrentEntry(null);
            return;
          }
        }
      } catch {
        // Ignore and show original error
      }

      setErrorMessage(result.error);
      setCurrentEntry(null);
    } else if (result.data) {
      setCurrentEntry(result.data);
      setIsSaved(isWordSaved(result.data.word));
    }
  }, []);

  const handleSelectEnglishWord = (word: string) => {
    setActiveTab("dictionary");
    setSuggestions([]);
    setSearchedWord(word);
    handleSearch(word);
  };

  const handleOpenFSRSReview = (word?: string) => {
    setTargetWordForReview(word);
    setIsReviewModalOpen(true);
  };

  const handleSaveWord = (word: string, nextState?: boolean) => {
    setIsSaved(nextState !== undefined ? nextState : isWordSaved(word));
  };

  useEffect(() => {
    if (currentEntry) {
      setIsSaved(isWordSaved(currentEntry.word));
    }
  }, [currentEntry]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navbar
        onSelectWord={(w) => handleSelectEnglishWord(w)}
        onOpenFSRSReview={handleOpenFSRSReview}
      />

      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-8 md:py-12 max-w-4xl mx-auto w-full">
        {/* Navigation Mode Switcher (Dictionary vs Sentence Translator) */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("dictionary")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "dictionary"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Tra Từ Điển &amp; Thẻ Nhớ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("translator")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "translator"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Languages className="w-4 h-4" />
              <span>Dịch Câu Công Sở</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Dictionary & Flashcards */}
        {activeTab === "dictionary" && (
          <div className="w-full flex flex-col items-center">
            {/* Hero Branding Header */}
            {!currentEntry && suggestions.length === 0 && !isLoading && !errorMessage && (
              <div className="text-center max-w-xl mx-auto mb-10 animate-in fade-in-50 duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Tra cứu Song ngữ Việt - Anh • Loại từ • Đồng nghĩa &amp; Trái nghĩa</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Master Workplace <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    English Vocabulary
                  </span>
                </h1>

                <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400">
                  Nhập tiếng Anh hoặc tiếng Việt để tra nghĩa chi tiết, phân loại từ loại, học từ đồng nghĩa / trái nghĩa và kịch bản hội thoại thực tế.
                </p>
              </div>
            )}

            {/* Central Search Bar */}
            <div className="w-full">
              <SearchBar
                onSearch={handleSearch}
                isLoading={isLoading}
                initialWord={searchedWord}
                currentEntry={currentEntry}
              />
            </div>

            {/* Bilingual Suggestion Comparison Grid */}
            {suggestions.length > 0 && !currentEntry && (
              <div className="w-full">
                <SuggestionGrid
                  query={suggestionQuery}
                  suggestions={suggestions}
                  onSelectWord={handleSelectEnglishWord}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Error State */}
            {errorMessage && suggestions.length === 0 && (
              <div className="w-full max-w-2xl mt-8 p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-center animate-in fade-in-50">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-3 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base mb-1">Thông Báo Tìm Kiếm</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {errorMessage}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handleSearch("hợp tác")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 hover:bg-amber-100/50 transition-colors"
                  >
                    Thử &quot;hợp tác&quot; (Việt)
                  </button>
                  <button
                    onClick={() => handleSearch("benchmark")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 hover:bg-amber-100/50 transition-colors"
                  >
                    Thử &quot;benchmark&quot; (Anh)
                  </button>
                  <button
                    onClick={() => handleSearch("điểm nghẽn")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 hover:bg-amber-100/50 transition-colors"
                  >
                    Thử &quot;điểm nghẽn&quot; (Việt)
                  </button>
                </div>
              </div>
            )}

            {/* Flashcard Result */}
            {currentEntry && (
              <div className="w-full">
                <Flashcard
                  entry={currentEntry}
                  isSaved={isSaved}
                  onSaveWord={handleSaveWord}
                  onReviewCard={(w) => handleOpenFSRSReview(w)}
                  onSelectWord={handleSelectEnglishWord}
                />
              </div>
            )}

            {/* Empty state feature highlights when not searching */}
            {!currentEntry && suggestions.length === 0 && !isLoading && !errorMessage && (
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    Phát Âm &amp; Song Ngữ
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Âm thanh chuẩn bản xứ, dịch nghĩa tiếng Việt sắc nét và phát âm câu ví dụ bằng TTS.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    Đồng Nghĩa &amp; Trái Nghĩa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Khám phá hệ thống từ đồng nghĩa, từ trái nghĩa có tương tác click-to-lookup lập tức.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    Hội Thoại Có Bản Dịch
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Kịch bản đối thoại văn phòng thực tế, phụ đề tiếng Việt kèm liên kết video ngữ cảnh YouGlish.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sentence Translator */}
        {activeTab === "translator" && (
          <div className="w-full">
            <SentenceTranslator onSelectWord={handleSelectEnglishWord} />
          </div>
        )}

        {/* FSRS Interactive Spaced Repetition Modal */}
        <FSRSReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          targetWord={targetWordForReview}
          onSessionUpdated={() => {
            if (currentEntry) {
              setIsSaved(isWordSaved(currentEntry.word));
            }
          }}
        />
      </main>

      <footer className="py-6 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-400">
        <p>EDUEN MVP &bull; Song Ngữ Việt - Anh &bull; Free Dictionary API &bull; Zero-Cost Architecture</p>
      </footer>
    </div>
  );
}
