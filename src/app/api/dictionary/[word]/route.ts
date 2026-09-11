import { NextRequest, NextResponse } from "next/server";
import { DictionaryEntry, Meaning, Definition } from "@/types/dictionary";
import { PRESET_DICTIONARY_ENTRIES } from "@/lib/fallbackData";
import { VIETNAMESE_LEXICON } from "@/lib/vietnameseLexicon";

// In-memory cache for fast repeat lookups
const globalWordCache = new Map<string, DictionaryEntry>();

const POS_MAP: Record<string, string> = {
  n: "noun",
  v: "verb",
  adj: "adjective",
  adv: "adverb",
  u: "general",
  prep: "preposition",
  conj: "conjunction",
  interj: "interjection",
};

const POS_VI_MAP: Record<string, string> = {
  noun: "Danh từ",
  verb: "Động từ",
  adjective: "Tính từ",
  adverb: "Trạng từ",
  preposition: "Giới từ",
  conjunction: "Liên từ",
  interjection: "Thán từ",
  pronoun: "Đại từ",
};

interface DatamuseResultItem {
  word: string;
  tags?: string[];
  defs?: string[];
}

/**
 * Fetch synonyms or antonyms from Datamuse API (fast, reliable)
 */
async function fetchDatamuseRelated(word: string, type: "rel_syn" | "rel_ant"): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?${type}=${encodeURIComponent(word)}&max=8`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return [];
    const items = await res.json();
    if (Array.isArray(items)) {
      return items.map((i: { word: string }) => i.word).filter((w) => Boolean(w) && w !== word);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Translate an English word to Vietnamese (using Lexicon cache or Google Translate free endpoint)
 */
async function getVietnameseWordTranslation(word: string): Promise<string> {
  const lower = word.toLowerCase();

  // 1. Check if word is defined in our Vietnamese Lexicon
  for (const entry of VIETNAMESE_LEXICON) {
    const matched = entry.suggestions.find((s) => s.word.toLowerCase() === lower);
    if (matched && matched.meaningVi) {
      return matched.meaningVi;
    }
  }

  // 2. Fetch from Google Translate free endpoint
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(
        word
      )}`,
      { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((s: unknown) => (Array.isArray(s) ? s[0] || "" : ""))
          .join("");
        if (translated) return translated;
      }
    }
  } catch {
    // Ignore error and return empty string
  }

  return "";
}

/**
 * Fetch from Datamuse API (fast ~200ms latency, zero-cost, always available)
 */
async function fetchFromDatamuse(word: string): Promise<DictionaryEntry | null> {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(word)}&md=dpr&ipa=1&max=1`,
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) return null;
    const items: DatamuseResultItem[] = await res.json();
    if (!items || items.length === 0 || !items[0].defs || items[0].defs.length === 0) {
      return null;
    }

    const item = items[0];
    if (!item.defs || item.defs.length === 0) {
      return null;
    }

    // Extract IPA phonetic if available
    const ipaTag = item.tags?.find((t) => t.startsWith("ipa_pron:"));
    const phonetic = ipaTag ? `/${ipaTag.replace("ipa_pron:", "")}/` : "";

    // Group definitions by part of speech
    const meaningsMap = new Map<string, Definition[]>();

    for (const rawDef of item.defs) {
      const parts = rawDef.split("\t");
      const posCode = parts[0];
      const defText = parts.slice(1).join("\t").trim();
      const partOfSpeech = POS_MAP[posCode] || posCode;

      if (!meaningsMap.has(partOfSpeech)) {
        meaningsMap.set(partOfSpeech, []);
      }

      meaningsMap.get(partOfSpeech)!.push({
        definition: defText,
      });
    }

    const meanings: Meaning[] = Array.from(meaningsMap.entries()).map(
      ([partOfSpeech, definitions]) => ({
        partOfSpeech,
        partOfSpeechVi: POS_VI_MAP[partOfSpeech] || partOfSpeech,
        definitions,
      })
    );

    return {
      word: item.word,
      phonetic,
      phonetics: [
        {
          text: phonetic,
          audio: `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${encodeURIComponent(
            item.word
          )}--_us_1.mp3`,
        },
      ],
      meanings,
      sourceUrls: [`https://en.wiktionary.org/wiki/${encodeURIComponent(item.word)}`],
    };
  } catch {
    return null;
  }
}

/**
 * Fetch from Free Dictionary API (rich phonetics & audio, but can have high network latency)
 */
async function fetchFromFreeDictionary(
  word: string,
  timeoutMs = 3500
): Promise<DictionaryEntry | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }
    );

    clearTimeout(timeout);

    if (!res.ok) return null;
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      return json[0] as DictionaryEntry;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Enrich a DictionaryEntry with Vietnamese translation, partOfSpeechVi, and comprehensive synonyms & antonyms
 */
async function enrichDictionaryEntry(entry: DictionaryEntry): Promise<DictionaryEntry> {
  const word = entry.word.toLowerCase();

  // 1. Ensure partOfSpeechVi exists for each meaning
  for (const m of entry.meanings) {
    if (!m.partOfSpeechVi) {
      const posClean = m.partOfSpeech.toLowerCase();
      m.partOfSpeechVi = POS_VI_MAP[posClean] || m.partOfSpeech;
    }
  }

  // 2. Aggregate existing synonyms and antonyms from all meanings/definitions
  const existingSyns = new Set<string>(entry.synonyms || []);
  const existingAnts = new Set<string>(entry.antonyms || []);

  for (const m of entry.meanings) {
    if (m.synonyms) m.synonyms.forEach((s) => existingSyns.add(s));
    if (m.antonyms) m.antonyms.forEach((a) => existingAnts.add(a));
    for (const d of m.definitions) {
      if (d.synonyms) d.synonyms.forEach((s) => existingSyns.add(s));
      if (d.antonyms) d.antonyms.forEach((a) => existingAnts.add(a));
    }
  }

  // 3. Parallel enrichment: fetch translation, Datamuse synonyms (if needed), and Datamuse antonyms
  const tasks: [Promise<string>, Promise<string[]>, Promise<string[]>] = [
    entry.translationVi ? Promise.resolve(entry.translationVi) : getVietnameseWordTranslation(word),
    existingSyns.size < 4 ? fetchDatamuseRelated(word, "rel_syn") : Promise.resolve([]),
    existingAnts.size < 3 ? fetchDatamuseRelated(word, "rel_ant") : Promise.resolve([]),
  ];

  const [translationVi, extraSyns, extraAnts] = await Promise.all(tasks);

  extraSyns.forEach((s) => existingSyns.add(s));
  extraAnts.forEach((a) => existingAnts.add(a));

  // Remove the word itself
  existingSyns.delete(word);
  existingAnts.delete(word);

  const synonymsList = Array.from(existingSyns);
  const antonymsList = Array.from(existingAnts);

  // Assign back to entry
  entry.translationVi = translationVi || entry.translationVi;
  entry.synonyms = synonymsList;
  entry.antonyms = antonymsList;

  // Also assign top synonyms/antonyms to first meaning if it was empty
  if (entry.meanings.length > 0) {
    const firstMeaning = entry.meanings[0];
    if (!firstMeaning.synonyms || firstMeaning.synonyms.length === 0) {
      firstMeaning.synonyms = synonymsList.slice(0, 6);
    }
    if (!firstMeaning.antonyms || firstMeaning.antonyms.length === 0) {
      firstMeaning.antonyms = antonymsList.slice(0, 6);
    }
  }

  return entry;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word } = await params;
  const decoded = decodeURIComponent(word || "").trim().toLowerCase();

  if (!decoded) {
    return NextResponse.json(
      { error: "Word parameter is required." },
      { status: 400 }
    );
  }

  // 1. Check in-memory cache
  if (globalWordCache.has(decoded)) {
    return NextResponse.json(globalWordCache.get(decoded));
  }

  // 2. Check preset dictionary entries
  if (PRESET_DICTIONARY_ENTRIES[decoded]) {
    const preset = await enrichDictionaryEntry({ ...PRESET_DICTIONARY_ENTRIES[decoded] });
    globalWordCache.set(decoded, preset);
    return NextResponse.json(preset);
  }

  // 3. Fast-racing multi-source strategy:
  // - Attempt Free Dictionary API within a 2.5s fast window
  // - Simultaneously start Datamuse fetch (which takes ~200ms)
  try {
    const [freeDictResult, datamuseResult] = await Promise.all([
      fetchFromFreeDictionary(decoded, 2500),
      fetchFromDatamuse(decoded),
    ]);

    // If Free Dictionary responded in time, prefer it
    if (freeDictResult) {
      const enriched = await enrichDictionaryEntry(freeDictResult);
      globalWordCache.set(decoded, enriched);
      return NextResponse.json(enriched);
    }

    // Otherwise use the lightning-fast Datamuse result
    if (datamuseResult) {
      const enriched = await enrichDictionaryEntry(datamuseResult);

      // Trigger background fetch to enhance cache if Free Dictionary is available later
      fetchFromFreeDictionary(decoded, 20000).then(async (bgResult) => {
        if (bgResult) {
          const bgEnriched = await enrichDictionaryEntry(bgResult);
          globalWordCache.set(decoded, bgEnriched);
        }
      });

      globalWordCache.set(decoded, enriched);
      return NextResponse.json(enriched);
    }

    return NextResponse.json(
      { error: `Could not find definitions for "${decoded}". Please check the spelling or try another term.` },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: `Could not load definitions for "${decoded}". Please try again.` },
      { status: 500 }
    );
  }
}

