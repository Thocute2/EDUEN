import { NextRequest, NextResponse } from "next/server";
import { TranslationRequest, TranslationResponse } from "@/types/dictionary";

// Fast in-memory cache to eliminate duplicate network calls
const translationCache = new Map<string, { translated: string; detectedLang: string }>();

/**
 * Call Google Translate free public endpoint with fallback
 */
async function translateText(
  text: string,
  sl: string = "auto",
  tl: string = "vi"
): Promise<{ translated: string; detectedLang: string }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { translated: "", detectedLang: "en" };
  }

  const cacheKey = `${sl}:${tl}:${trimmed.toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
      sl
    )}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(trimmed)}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Translation service returned status ${res.status}`);
    }

    const data = await res.json();
    let fullTranslation = "";
    let detectedLang = sl;

    if (Array.isArray(data) && Array.isArray(data[0])) {
      fullTranslation = data[0]
        .map((segment: unknown) => (Array.isArray(segment) ? segment[0] || "" : ""))
        .join("");
    }

    if (Array.isArray(data) && data[2]) {
      detectedLang = String(data[2]);
    }

    const result = {
      translated: fullTranslation || trimmed,
      detectedLang,
    };

    translationCache.set(cacheKey, result);
    return result;
  } catch {
    // Fallback: return original text safely
    return { translated: trimmed, detectedLang: sl };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const sl = searchParams.get("sl") || "auto";
  const tl = searchParams.get("tl") || "vi";

  if (!q.trim()) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required." },
      { status: 400 }
    );
  }

  const result = await translateText(q, sl, tl);

  return NextResponse.json({
    translatedText: result.translated,
    detectedLang: result.detectedLang,
  } as TranslationResponse);
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const sl = body.sl || "auto";
    const tl = body.tl || "vi";

    // Handle batch texts translation
    if (Array.isArray(body.texts) && body.texts.length > 0) {
      const results = await Promise.all(
        body.texts.map((t) => translateText(t, sl, tl))
      );

      return NextResponse.json({
        translatedTexts: results.map((r) => r.translated),
        detectedLang: results[0]?.detectedLang || "en",
      } as TranslationResponse);
    }

    // Handle single text translation
    if (body.text) {
      const result = await translateText(body.text, sl, tl);
      return NextResponse.json({
        translatedText: result.translated,
        detectedLang: result.detectedLang,
      } as TranslationResponse);
    }

    return NextResponse.json(
      { error: "Either 'text' or 'texts' is required in the request body." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to process translation request.",
      },
      { status: 500 }
    );
  }
}
