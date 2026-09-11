import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PartOfSpeechInfo {
  vi: string;
  en: string;
  abbr: string;
  badgeClass: string;
  pillActiveClass: string;
  pillInactiveClass: string;
  dotColor: string;
}

const POS_MAP: Record<string, PartOfSpeechInfo> = {
  noun: {
    vi: "Danh từ",
    en: "Noun",
    abbr: "n.",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800/80",
    pillActiveClass: "bg-blue-600 text-white shadow-md shadow-blue-500/25",
    pillInactiveClass: "bg-blue-50/70 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60",
    dotColor: "bg-blue-500",
  },
  verb: {
    vi: "Động từ",
    en: "Verb",
    abbr: "v.",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80",
    pillActiveClass: "bg-emerald-600 text-white shadow-md shadow-emerald-500/25",
    pillInactiveClass: "bg-emerald-50/70 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60",
    dotColor: "bg-emerald-500",
  },
  adjective: {
    vi: "Tính từ",
    en: "Adjective",
    abbr: "adj.",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800/80",
    pillActiveClass: "bg-purple-600 text-white shadow-md shadow-purple-500/25",
    pillInactiveClass: "bg-purple-50/70 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60",
    dotColor: "bg-purple-500",
  },
  adverb: {
    vi: "Trạng từ",
    en: "Adverb",
    abbr: "adv.",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80",
    pillActiveClass: "bg-amber-600 text-white shadow-md shadow-amber-500/25",
    pillInactiveClass: "bg-amber-50/70 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60",
    dotColor: "bg-amber-500",
  },
  preposition: {
    vi: "Giới từ",
    en: "Preposition",
    abbr: "prep.",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800/80",
    pillActiveClass: "bg-cyan-600 text-white shadow-md shadow-cyan-500/25",
    pillInactiveClass: "bg-cyan-50/70 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-900/60",
    dotColor: "bg-cyan-500",
  },
  conjunction: {
    vi: "Liên từ",
    en: "Conjunction",
    abbr: "conj.",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80",
    pillActiveClass: "bg-rose-600 text-white shadow-md shadow-rose-500/25",
    pillInactiveClass: "bg-rose-50/70 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60",
    dotColor: "bg-rose-500",
  },
  interjection: {
    vi: "Thán từ",
    en: "Interjection",
    abbr: "interj.",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800/80",
    pillActiveClass: "bg-orange-600 text-white shadow-md shadow-orange-500/25",
    pillInactiveClass: "bg-orange-50/70 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-900/60",
    dotColor: "bg-orange-500",
  },
  pronoun: {
    vi: "Đại từ",
    en: "Pronoun",
    abbr: "pron.",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800/80",
    pillActiveClass: "bg-indigo-600 text-white shadow-md shadow-indigo-500/25",
    pillInactiveClass: "bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60",
    dotColor: "bg-indigo-500",
  },
};

/**
 * Get standardized bilingual information and styling for a Part of Speech
 */
export function getPartOfSpeechInfo(pos?: string): PartOfSpeechInfo {
  if (!pos) {
    return {
      vi: "Từ loại",
      en: "General",
      abbr: "w.",
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      pillActiveClass: "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm",
      pillInactiveClass: "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
      dotColor: "bg-slate-400",
    };
  }

  const clean = pos.toLowerCase().trim();
  if (POS_MAP[clean]) {
    return POS_MAP[clean];
  }

  // Common aliases
  if (clean === "n" || clean.startsWith("noun")) return POS_MAP.noun;
  if (clean === "v" || clean.startsWith("verb")) return POS_MAP.verb;
  if (clean === "adj" || clean.startsWith("adject")) return POS_MAP.adjective;
  if (clean === "adv" || clean.startsWith("adverb")) return POS_MAP.adverb;
  if (clean === "prep") return POS_MAP.preposition;
  if (clean === "conj") return POS_MAP.conjunction;
  if (clean === "interj") return POS_MAP.interjection;

  return {
    vi: clean,
    en: clean,
    abbr: clean.slice(0, 4),
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    pillActiveClass: "bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-sm",
    pillInactiveClass: "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
    dotColor: "bg-slate-400",
  };
}

const COMMON_STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
  "this", "that", "these", "those", "then", "just", "so", "than", "such",
  "in", "on", "at", "to", "for", "with", "by", "from", "about", "into", "through",
  "after", "over", "between", "out", "against", "during", "without", "before",
  "under", "around", "among", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "can", "could", "will", "would",
  "shall", "should", "may", "might", "must", "it", "its", "they", "them", "their",
  "we", "us", "our", "you", "your", "he", "him", "his", "she", "her", "i", "me", "my",
  "very", "too", "also", "now", "here", "there", "when", "where", "why", "how",
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "no", "not",
]);

/**
 * Extract valuable vocabulary keywords from an English sentence
 */
export function extractKeywordsFromSentence(sentence: string): string[] {
  if (!sentence) return [];
  const words = sentence
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'“”—–]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 3 && !COMMON_STOP_WORDS.has(w) && !/^\d+$/.test(w));

  // Deduplicate while maintaining appearance order
  return Array.from(new Set(words)).slice(0, 8);
}
