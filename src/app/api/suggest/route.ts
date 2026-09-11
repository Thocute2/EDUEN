import { NextRequest, NextResponse } from "next/server";
import { WordSuggestion, SuggestionResponse } from "@/types/dictionary";
import {
  containsVietnameseDiacritics,
  findInVietnameseLexicon,
  removeVietnameseAccents,
} from "@/lib/vietnameseLexicon";
import { PRESET_DICTIONARY_ENTRIES } from "@/lib/fallbackData";

// In-memory cache for fast repeated suggestion requests
const suggestionCache = new Map<string, SuggestionResponse>();

interface DatamuseSynItem {
  word: string;
  score?: number;
  tags?: string[];
}

/**
 * Fetch English synonyms from Datamuse (free, zero-cost)
 */
async function fetchDatamuseSynonyms(word: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const [synRes, mlRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=4`, {
        signal: controller.signal,
      }),
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=4`, {
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeout);

    const syns: DatamuseSynItem[] = synRes.ok ? await synRes.json() : [];
    const mls: DatamuseSynItem[] = mlRes.ok ? await mlRes.json() : [];

    const words = [...syns, ...mls]
      .map((item) => item.word.toLowerCase())
      .filter((w) => w !== word.toLowerCase() && !w.includes(" ") && w.length > 2);

    return Array.from(new Set(words)).slice(0, 4);
  } catch {
    return [];
  }
}

/**
 * Fetch English autocompletions for English search
 */
async function fetchEnglishAutocomplete(query: string): Promise<WordSuggestion[]> {
  const suggestions: WordSuggestion[] = [];
  const lower = query.toLowerCase();

  // 1. Check preset dictionary bank
  Object.keys(PRESET_DICTIONARY_ENTRIES).forEach((w) => {
    if (w.startsWith(lower) || w.includes(lower)) {
      const entry = PRESET_DICTIONARY_ENTRIES[w];
      suggestions.push({
        word: entry.word,
        pos: entry.meanings[0]?.partOfSpeech || "noun",
        meaningVi: entry.meanings[0]?.definitions[0]?.definition || "Business terminology",
        type: w === lower ? "primary" : "synonym",
        badge: "Sẵn có",
      });
    }
  });

  // 2. Fetch from Datamuse suggestion API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=6`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const items: { word: string }[] = await res.json();
      for (const item of items) {
        const cleanWord = item.word.toLowerCase();
        if (!suggestions.some((s) => s.word.toLowerCase() === cleanWord)) {
          suggestions.push({
            word: cleanWord,
            type: cleanWord === lower ? "primary" : "related",
            meaningVi: "English vocabulary word",
            badge: "Gợi ý",
          });
        }
      }
    }
  } catch {
    // Ignore error and return existing suggestions
  }

  return suggestions.slice(0, 6);
}

/**
 * Fetch translation and dictionary alternatives from Google GTX endpoint
 */
async function fetchGoogleGTXTranslation(
  query: string,
  forceVietnamese: boolean
): Promise<{
  primaryWord: string | null;
  detectedLang: string;
  alternatives: WordSuggestion[];
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const sl = forceVietnamese ? "vi" : "auto";
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=en&dt=t&dt=bd&dt=ss&q=${encodeURIComponent(
        query
      )}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return { primaryWord: null, detectedLang: "en", alternatives: [] };
    }

    const data = await res.json();
    const primaryWord = data?.[0]?.[0]?.[0]?.trim().toLowerCase() || null;
    const detectedLang = data?.[2] || (forceVietnamese ? "vi" : "en");

    const alternatives: WordSuggestion[] = [];

    // Parse dt=bd (dictionary alternative words grouped by part of speech)
    // Structure: data[1] = [ [ "noun", ["word1", "word2"], [ ["word1", ["nghĩa 1", "nghĩa 2"]] ] ] ]
    if (Array.isArray(data?.[1])) {
      for (const group of data[1]) {
        const pos = group[0]; // e.g. "verb", "noun", "adjective"
        const details = group[2]; // array of [word, [vietnamese_meanings], ...]

        if (Array.isArray(details)) {
          for (const item of details) {
            const enWord = item[0]?.toLowerCase().trim();
            const viMeanings = Array.isArray(item[1]) ? item[1].join(", ") : "";

            if (enWord && !enWord.includes(" ")) {
              alternatives.push({
                word: enWord,
                pos: typeof pos === "string" ? pos : undefined,
                meaningVi: viMeanings || `Từ khóa tương ứng (${pos})`,
                type: enWord === primaryWord ? "primary" : "synonym",
                badge: enWord === primaryWord ? "Chính xác" : "Đồng nghĩa",
              });
            }
          }
        }
      }
    }

    return { primaryWord, detectedLang, alternatives };
  } catch {
    return { primaryWord: null, detectedLang: "en", alternatives: [] };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q) {
    return NextResponse.json({ query: "", isVietnamese: false, suggestions: [] });
  }

  const cacheKey = q.toLowerCase();
  if (suggestionCache.has(cacheKey)) {
    return NextResponse.json(suggestionCache.get(cacheKey));
  }

  const hasDiacritics = containsVietnameseDiacritics(q);
  const localCurated = findInVietnameseLexicon(q);

  const isVietnamese = hasDiacritics || !!localCurated;

  let combinedSuggestions: WordSuggestion[] = [];

  if (isVietnamese) {
    // 1. Add curated workplace lexicon if matched (highest priority & highest quality)
    if (localCurated) {
      combinedSuggestions.push(...localCurated);
    }

    // 1.5. If query has multiple words, dissect and check sub-terms in lexicon
    const wordsInQuery = q.split(/\s+/).filter((w) => w.length >= 2);
    if (wordsInQuery.length > 1) {
      // Check 2-word pairs and single words
      for (let i = 0; i < wordsInQuery.length; i++) {
        const singleWord = wordsInQuery[i];
        const subMatch = findInVietnameseLexicon(singleWord);
        if (subMatch) {
          for (const s of subMatch) {
            if (!combinedSuggestions.some((x) => x.word.toLowerCase() === s.word.toLowerCase())) {
              combinedSuggestions.push({
                ...s,
                badge: s.badge || "Bóc tách",
              });
            }
          }
        }
        if (i < wordsInQuery.length - 1) {
          const pair = `${wordsInQuery[i]} ${wordsInQuery[i + 1]}`;
          const pairMatch = findInVietnameseLexicon(pair);
          if (pairMatch) {
            for (const s of pairMatch) {
              if (!combinedSuggestions.some((x) => x.word.toLowerCase() === s.word.toLowerCase())) {
                combinedSuggestions.push({
                  ...s,
                  badge: s.badge || "Cụm từ",
                });
              }
            }
          }
        }
      }
    }

    // 2. Query Google GTX for translation & parts of speech
    const gtx = await fetchGoogleGTXTranslation(q, true);

    if (gtx.primaryWord) {
      const pWord = gtx.primaryWord.toLowerCase();
      // If primary translation is a multi-word phrase (e.g. "project presentation")
      if (pWord.includes(" ")) {
        // Dissect into individual words
        const dissected = pWord
          .split(/\s+/)
          .map((w) => w.replace(/[^a-zA-Z-]/g, "").trim())
          .filter((w) => w.length > 2);

        for (const dw of dissected) {
          if (!combinedSuggestions.some((s) => s.word.toLowerCase() === dw)) {
            combinedSuggestions.push({
              word: dw,
              meaningVi: `Từ khóa chính trích xuất từ "${q}"`,
              type: "primary",
              badge: "Bóc tách",
            });
          }
        }
      } else {
        // Single word
        const alreadyHasPrimary = combinedSuggestions.some(
          (s) => s.word.toLowerCase() === pWord
        );
        if (!alreadyHasPrimary) {
          combinedSuggestions.unshift({
            word: pWord,
            meaningVi: `Bản dịch trực tiếp cho "${q}"`,
            type: "primary",
            badge: "Chính xác",
          });
        }
      }
    }

    // Add alternative words from GTX (filter out archaic or obscure entries like quisle)
    const OBSCURE_WORDS = new Set(["quisle", "quisled", "quisling"]);
    for (const alt of gtx.alternatives) {
      if (
        !OBSCURE_WORDS.has(alt.word.toLowerCase()) &&
        !combinedSuggestions.some((s) => s.word.toLowerCase() === alt.word.toLowerCase())
      ) {
        combinedSuggestions.push(alt);
      }
    }

    // 3. If we have a primary word, fetch English synonyms via Datamuse to expand options
    const targetWord = combinedSuggestions[0]?.word;
    if (targetWord && combinedSuggestions.length < 5) {
      const synWords = await fetchDatamuseSynonyms(targetWord);
      for (const syn of synWords) {
        if (!combinedSuggestions.some((s) => s.word.toLowerCase() === syn)) {
          combinedSuggestions.push({
            word: syn,
            meaningVi: `Từ đồng nghĩa với "${targetWord}" trong ngữ cảnh`,
            type: "synonym",
            badge: "Gần nghĩa",
          });
        }
      }
    }
  } else {
    // Check if sl=auto from Google GTX detects Vietnamese (e.g. unaccented Vietnamese "hop tac")
    const gtx = await fetchGoogleGTXTranslation(q, false);

    if (gtx.detectedLang === "vi" && gtx.primaryWord && gtx.primaryWord.toLowerCase() !== q.toLowerCase()) {
      // Detected unaccented Vietnamese!
      if (gtx.primaryWord && !gtx.primaryWord.includes(" ")) {
        combinedSuggestions.push({
          word: gtx.primaryWord,
          meaningVi: `Bản dịch cho "${q}"`,
          type: "primary",
          badge: "Chính xác",
        });
      }

      for (const alt of gtx.alternatives) {
        if (!combinedSuggestions.some((s) => s.word.toLowerCase() === alt.word.toLowerCase())) {
          combinedSuggestions.push(alt);
        }
      }

      if (combinedSuggestions.length > 0) {
        const response: SuggestionResponse = {
          query: q,
          isVietnamese: true,
          suggestions: combinedSuggestions.slice(0, 8),
        };
        suggestionCache.set(cacheKey, response);
        return NextResponse.json(response);
      }
    }

    // English search flow
    const englishAutocompletes = await fetchEnglishAutocomplete(q);
    combinedSuggestions.push(...englishAutocompletes);

    // Also if query looks like a complete English word, fetch synonyms
    if (q.length >= 3 && !q.includes(" ")) {
      const syns = await fetchDatamuseSynonyms(q);
      for (const syn of syns) {
        if (!combinedSuggestions.some((s) => s.word.toLowerCase() === syn)) {
          combinedSuggestions.push({
            word: syn,
            meaningVi: `Synonym of "${q}"`,
            type: "synonym",
            badge: "Đồng nghĩa",
          });
        }
      }
    }
  }

  // Deduplicate and cap to 8 items
  const uniqueMap = new Map<string, WordSuggestion>();
  for (const item of combinedSuggestions) {
    const key = item.word.toLowerCase().trim();
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  const finalSuggestions = Array.from(uniqueMap.values()).slice(0, 8);

  const response: SuggestionResponse = {
    query: q,
    isVietnamese: isVietnamese || (combinedSuggestions.length > 0 && isVietnamese),
    suggestions: finalSuggestions,
  };

  suggestionCache.set(cacheKey, response);
  return NextResponse.json(response);
}
