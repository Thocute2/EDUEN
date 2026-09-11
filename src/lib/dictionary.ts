import { DictionaryEntry } from "@/types/dictionary";
import { PRESET_DICTIONARY_ENTRIES } from "./fallbackData";

export interface FetchResult {
  data: DictionaryEntry | null;
  error: string | null;
}

/**
 * Fetch word definition from Dictionary API or Instant Preset Cache
 * @param word The English word to search for
 */
export async function fetchWordDefinition(word: string): Promise<FetchResult> {
  const trimmed = word.trim().toLowerCase();
  if (!trimmed) {
    return { data: null, error: "Please enter a word to search." };
  }

  // Instant response if word is in preset bank
  if (PRESET_DICTIONARY_ENTRIES[trimmed]) {
    return { data: PRESET_DICTIONARY_ENTRIES[trimmed], error: null };
  }

  // Fetch via local API route (with multi-source fast racing & fallback)
  try {
    const res = await fetch(`/api/dictionary/${encodeURIComponent(trimmed)}`);
    const json = await res.json();

    if (!res.ok || json.error) {
      return {
        data: null,
        error:
          json.error ||
          `Could not find definitions for "${trimmed}". Please check the spelling.`,
      };
    }

    return { data: json as DictionaryEntry, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error
          ? err.message
          : `Could not load definition for "${trimmed}". Please check your internet connection.`,
    };
  }
}

/**
 * Translate an English or Vietnamese sentence via zero-cost API route
 */
export async function translateSentence(
  text: string,
  sl: string = "auto",
  tl: string = "vi"
): Promise<{ translated: string; error: string | null }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translated: "", error: null };
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed, sl, tl }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return { translated: trimmed, error: data.error || "Translation failed" };
    }
    return { translated: data.translatedText || trimmed, error: null };
  } catch (err) {
    return {
      translated: trimmed,
      error: err instanceof Error ? err.message : "Translation network error",
    };
  }
}

