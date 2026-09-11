import { NextRequest, NextResponse } from "next/server";
import { TranslationRequest, TranslationResponse } from "@/types/dictionary";

// Fast in-memory cache to eliminate duplicate network calls
const translationCache = new Map<string, { translated: string; detectedLang: string }>();

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Robust 3-tier translation engine:
 * Tier 1: Google Translate Chrome Extension Endpoint (super fast, high quality, no CAPTCHA)
 * Tier 2: Google Mobile Web Endpoint (accurate full sentence context)
 * Tier 3: MyMemory API (public translation memory backup)
 */
export async function translateText(
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

  // Tier 1: Google Translate Chrome Extension Endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${encodeURIComponent(
      sl
    )}&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      let translated = "";
      let detectedLang = sl === "auto" ? "en" : sl;

      if (Array.isArray(data)) {
        if (Array.isArray(data[0])) {
          translated = String(data[0][0] || "");
          detectedLang = String(data[0][1] || detectedLang);
        } else if (typeof data[0] === "string") {
          translated = data[0];
        }
      }

      if (translated) {
        const result = {
          translated: decodeHtmlEntities(translated),
          detectedLang,
        };
        translationCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Tier 1 translate failed:", err instanceof Error ? err.message : String(err));
  }

  // Tier 2: Google Mobile Web Endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://translate.google.com/m?sl=${encodeURIComponent(
      sl
    )}&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(trimmed)}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<div class="result-container">([\s\S]*?)<\/div>/);
      if (match && match[1]) {
        const cleaned = decodeHtmlEntities(match[1].trim());
        if (cleaned) {
          const result = { translated: cleaned, detectedLang: sl };
          translationCache.set(cacheKey, result);
          return result;
        }
      }
    }
  } catch (err) {
    console.warn("Tier 2 translate failed:", err instanceof Error ? err.message : String(err));
  }

  // Tier 3: MyMemory Translation API
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const pair = `${sl === "auto" ? "en" : sl}|${tl}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${encodeURIComponent(pair)}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        const cleaned = decodeHtmlEntities(data.responseData.translatedText);
        const result = { translated: cleaned, detectedLang: sl };
        translationCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Tier 3 translate failed:", err instanceof Error ? err.message : String(err));
  }

  // Fallback: return original text safely
  return { translated: trimmed, detectedLang: sl };
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
