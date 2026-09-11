"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, Loader2, Sparkles, ArrowRight, Languages } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WordSuggestion, SuggestionResponse, DictionaryEntry } from "@/types/dictionary";
import { containsVietnameseDiacritics, VIETNAMESE_LEXICON } from "@/lib/vietnameseLexicon";

interface SearchBarProps {
  onSearch: (word: string) => void;
  onSelectSuggestion?: (suggestion: WordSuggestion) => void;
  isLoading?: boolean;
  initialWord?: string;
  currentEntry?: DictionaryEntry | null;
}

const DEFAULT_SIMILAR_WORDS_VI = [
  "hợp tác",
  "cộng tác",
  "phối hợp",
  "điểm nghẽn",
  "nút thắt",
  "ủy quyền",
  "giao việc",
  "khả thi",
  "thương lượng",
];

const DEFAULT_SIMILAR_WORDS_EN = [
  "synergy",
  "collaboration",
  "cooperation",
  "benchmark",
  "standard",
  "delegate",
  "assign",
  "bottleneck",
  "obstacle",
  "feasibility",
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSelectSuggestion,
  isLoading = false,
  initialWord = "",
  currentEntry = null,
}) => {
  const [query, setQuery] = useState(initialWord);
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [langMode, setLangMode] = useState<"en" | "vi">("en");

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initialWord
  useEffect(() => {
    if (initialWord) {
      setQuery(initialWord);
      if (containsVietnameseDiacritics(initialWord)) {
        setLangMode("vi");
      }
    }
  }, [initialWord]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced suggestion fetcher
  const fetchSuggestions = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSuggesting(false);
      return;
    }

    setIsSuggesting(true);
    try {
      const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data: SuggestionResponse = await res.json();
        setSuggestions(data.suggestions || []);
        if (data.isVietnamese) {
          setLangMode("vi");
        }
        setShowDropdown((data.suggestions || []).length > 0);
        setSelectedIndex(-1);
      }
    } catch {
      // Ignore suggestion fetch errors
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  // Handle query change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Quick detection: if typing with Vietnamese accents, auto-switch to vi mode
    if (containsVietnameseDiacritics(value)) {
      setLangMode("vi");
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
  };

  const handleSelectWord = (item: WordSuggestion) => {
    setShowDropdown(false);
    setQuery(item.word);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    }
    onSearch(item.word);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelectWord(suggestions[selectedIndex]);
      return;
    }

    if (query.trim() && !isLoading) {
      setShowDropdown(false);
      onSearch(query.trim());
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleChipClick = (word: string) => {
    setQuery(word);
    if (containsVietnameseDiacritics(word)) {
      setLangMode("vi");
    }
    setShowDropdown(false);
    onSearch(word);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Determine list of similar / synonym words based on currentEntry and langMode
  const similarWords = useMemo(() => {
    if (langMode === "en") {
      if (currentEntry) {
        const set = new Set<string>();
        currentEntry.synonyms?.forEach((s) => set.add(s.trim()));
        currentEntry.meanings?.forEach((m) => {
          m.synonyms?.forEach((s) => set.add(s.trim()));
          m.definitions?.forEach((d) => d.synonyms?.forEach((s) => set.add(s.trim())));
        });
        const list = Array.from(set).filter(
          (w) => Boolean(w) && w.toLowerCase() !== currentEntry.word.toLowerCase()
        );
        if (list.length > 0) {
          return list.slice(0, 8);
        }
      }
      return DEFAULT_SIMILAR_WORDS_EN;
    } else {
      // Vietnamese mode
      if (currentEntry) {
        const lower = currentEntry.word.toLowerCase();
        // Check lexicon for this word
        for (const lex of VIETNAMESE_LEXICON) {
          if (lex.suggestions.some((s) => s.word.toLowerCase() === lower)) {
            return lex.keywords;
          }
        }
        if (currentEntry.translationVi) {
          const transLower = currentEntry.translationVi.toLowerCase();
          for (const lex of VIETNAMESE_LEXICON) {
            if (
              lex.vietnamese.toLowerCase().includes(transLower) ||
              transLower.includes(lex.vietnamese.toLowerCase())
            ) {
              return lex.keywords;
            }
          }
        }
      }
      return DEFAULT_SIMILAR_WORDS_VI;
    }
  }, [currentEntry, langMode]);

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto relative">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          {/* Left search/spinner icon */}
          <div className="absolute left-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10">
            {isLoading || isSuggesting ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <Input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={
              langMode === "vi"
                ? "Tìm từ tiếng Việt"
                : "Search English word"
            }
            className="pl-12 pr-44 sm:pr-48 h-14 text-base sm:text-lg rounded-2xl border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg shadow-slate-200/50 dark:shadow-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all"
            disabled={isLoading}
            autoFocus
          />

          {/* Right controls: Language Toggle (EN/VN), Clear, and Submit */}
          <div className="absolute right-2 sm:right-2.5 flex items-center gap-1 sm:gap-1.5 z-10">
            {/* Toggle EN-VN inside search box */}
            <div
              className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 select-none shadow-xs"
              role="group"
              aria-label="Language Mode Toggle"
            >
              <button
                type="button"
                onClick={() => setLangMode("en")}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  langMode === "en"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title="Tra cứu Tiếng Anh (English)"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLangMode("vi")}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  langMode === "vi"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                title="Tra cứu Tiếng Việt"
              >
                VN
              </button>
            </div>

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <Button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 sm:px-4 h-9 sm:h-10 text-xs sm:text-sm font-medium transition-all shadow-md shadow-indigo-500/20"
            >
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Floating Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="px-4 py-2 bg-indigo-50/70 dark:bg-slate-800/60 border-b border-indigo-100/60 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5" />
              {langMode === "vi"
                ? "Gợi ý từ khóa tiếng Anh tương ứng:"
                : "Gợi ý từ vựng liên quan:"}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              Dùng phím ↑ ↓ và Enter để chọn
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.word}-${idx}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelectWord(item)}
                  className={`px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? "bg-indigo-50/80 dark:bg-indigo-950/50"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {item.word}
                      </span>
                      {item.pos && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {item.pos}
                        </span>
                      )}
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100/70 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.meaningVi}
                    </p>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected
                        ? "text-indigo-600 dark:text-indigo-400 translate-x-1"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Similar Words / Synonyms List */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs animate-in fade-in-50 duration-200">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium select-none mr-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Từ tương tự hoặc đồng nghĩa:</span>
        </div>

        {similarWords.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => handleChipClick(word)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-all cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 font-medium active:scale-95"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};
