"use client";

import React, { useState } from "react";
import {
  Languages,
  Volume2,
  Copy,
  Check,
  ArrowRightLeft,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
  Send,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { translateSentence } from "@/lib/dictionary";
import { speechService } from "@/lib/speech";
import { extractKeywordsFromSentence } from "@/lib/utils";

interface SentenceTranslatorProps {
  onSelectWord?: (word: string) => void;
}

interface SampleSentence {
  category: string;
  en: string;
  vi: string;
}

const SAMPLE_SENTENCES: SampleSentence[] = [
  {
    category: "Email công việc",
    en: "Could you please send me the updated quarterly financial report by 3 PM?",
    vi: "Bạn có thể vui lòng gửi cho tôi báo cáo tài chính hàng quý đã cập nhật trước 3 giờ chiều được không?",
  },
  {
    category: "Họp tiến độ dự án",
    en: "Code review delays became the main bottleneck in our CI/CD deployment pipeline.",
    vi: "Sự chậm trễ trong khâu duyệt mã đã trở thành điểm nghẽn chính trong quy trình triển khai CI/CD của chúng tôi.",
  },
  {
    category: "Giao việc & Quản lý",
    en: "A successful engineering manager knows how to delegate operational duties to senior team members.",
    vi: "Một nhà quản lý kỹ thuật giỏi biết cách giao phó các nhiệm vụ vận hành cho các thành viên cấp cao trong nhóm.",
  },
  {
    category: "Đàm phán & Hợp tác",
    en: "The strategic merger created tremendous commercial synergy between engineering talent and sales reach.",
    vi: "Thương vụ sáp nhập chiến lược đã tạo ra sức mạnh cộng hưởng thương mại to lớn giữa nhân tài kỹ thuật và phạm vi bán hàng.",
  },
  {
    category: "Đánh giá hiệu suất",
    en: "We used AWS top-tier services as a benchmark to measure our response latency.",
    vi: "Chúng tôi đã dùng các dịch vụ hàng đầu của AWS làm điểm chuẩn để đo lường độ trễ phản hồi của mình.",
  },
];

export const SentenceTranslator: React.FC<SentenceTranslatorProps> = ({
  onSelectWord,
}) => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [direction, setDirection] = useState<"en-vi" | "vi-en">("en-vi");
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async (textToTranslate?: string) => {
    const text = (textToTranslate ?? inputText).trim();
    if (!text) {
      setTranslatedText("");
      setError(null);
      return;
    }

    setIsTranslating(true);
    setError(null);

    const sl = direction === "en-vi" ? "en" : "vi";
    const tl = direction === "en-vi" ? "vi" : "en";

    const result = await translateSentence(text, sl, tl);

    setIsTranslating(false);
    if (result.error) {
      setError(result.error);
    } else {
      setTranslatedText(result.translated);
    }
  };

  const handleSwapDirection = () => {
    const nextDir = direction === "en-vi" ? "vi-en" : "en-vi";
    setDirection(nextDir);
    // Swap contents if available
    if (translatedText) {
      const oldInput = inputText;
      setInputText(translatedText);
      setTranslatedText(oldInput);
    }
  };

  const handlePlaySpeech = (text: string) => {
    if (!text.trim()) return;
    setIsPlayingAudio(true);
    speechService.play(
      text,
      undefined,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectSample = (sample: SampleSentence) => {
    if (direction === "en-vi") {
      setInputText(sample.en);
      setTranslatedText(sample.vi);
    } else {
      setInputText(sample.vi);
      setTranslatedText(sample.en);
    }
    setError(null);
  };

  // Extract valuable keywords from English text
  const englishTextForKeywords = direction === "en-vi" ? inputText : translatedText;
  const keywords = extractKeywordsFromSentence(englishTextForKeywords);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in-50 duration-300">
      {/* Container Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Dịch Câu &amp; Ngữ Cảnh Công Sở
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dịch văn bản hai chiều Anh - Việt, nghe phát âm và bóc tách từ vựng
              </p>
            </div>
          </div>

          {/* Direction Switcher */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {direction === "en-vi" ? "Tiếng Anh" : "Tiếng Việt"}
            </span>

            <button
              type="button"
              onClick={handleSwapDirection}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Đổi chiều ngôn ngữ"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {direction === "en-vi" ? "Tiếng Việt" : "Tiếng Anh"}
            </span>
          </div>
        </div>

        {/* Translation Work Area */}
        <div className="p-6 md:p-8 space-y-5">
          {/* Input Box */}
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                direction === "en-vi"
                  ? "Nhập câu tiếng Anh công sở hoặc đoạn email cần dịch... (Ví dụ: Could you please send me the updated quarterly report?)"
                  : "Nhập câu tiếng Việt cần chuyển sang tiếng Anh chuyên nghiệp..."
              }
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 dark:text-slate-100 text-sm md:text-base leading-relaxed resize-none transition-all placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleTranslate();
                }
              }}
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">Enter</kbd> để dịch nhanh
              </span>

              <div className="flex items-center gap-2">
                {inputText && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText("");
                      setTranslatedText("");
                    }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                )}

                {inputText && (
                  <button
                    type="button"
                    onClick={() => handlePlaySpeech(inputText)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                    title="Nghe phát âm văn bản gốc"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe</span>
                  </button>
                )}

                <Button
                  onClick={() => handleTranslate()}
                  disabled={isTranslating || !inputText.trim()}
                  className="rounded-xl gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm shadow-indigo-500/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTranslating ? "Đang dịch..." : "Dịch câu"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Translation Result Box */}
          {translatedText && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 space-y-3 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bản dịch {direction === "en-vi" ? "Tiếng Việt" : "Tiếng Anh"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePlaySpeech(translatedText)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Nghe phát âm bản dịch"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white/80 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Sao chép bản dịch"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-base md:text-lg text-slate-900 dark:text-white font-medium leading-relaxed">
                {translatedText}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Key Vocabulary Extraction from the Sentence */}
          {keywords.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  Từ vựng quan trọng trong câu (Bấm để tra từ điển &amp; xem thẻ nhớ)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {keywords.length} từ
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {keywords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => onSelectWord?.(word)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-600 dark:hover:text-white text-xs font-semibold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
                    title={`Tra cứu "${word}" trong từ điển`}
                  >
                    <Search className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                    <span>{word}</span>
                    <ArrowRight className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Curated Sample Workplace Sentences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Mẫu Câu Giao Tiếp Công Sở Thông Dụng (Thử nghiệm 1 chạm)</span>
          </h3>
          <span className="text-xs text-slate-400">5 mẫu tiêu biểu</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAMPLE_SENTENCES.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 transition-all cursor-pointer space-y-1.5 group"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {sample.category}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                &ldquo;{sample.en}&rdquo;
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {sample.vi}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
