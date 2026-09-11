"use client";

import React, { useState, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  ExternalLink,
  Briefcase,
  Play,
  Square,
  Video,
  Languages,
  Check,
  Copy,
  Brain,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Split,
} from "lucide-react";
import { DictionaryEntry } from "@/types/dictionary";
import { speechService } from "@/lib/speech";
import { getWorkplaceScenario } from "@/lib/scenarios";
import { Button } from "@/components/ui/button";
import {
  FSRSFlashcard,
  getFSRSFlashcardByWord,
  saveFSRSFlashcard,
  removeFSRSFlashcard,
} from "@/lib/storage";
import { getFSRSStateInfo, formatIntervalPreview, isCardDue } from "@/lib/fsrs";
import { getPartOfSpeechInfo } from "@/lib/utils";

interface FlashcardProps {
  entry: DictionaryEntry;
  onSaveWord?: (word: string, saved: boolean) => void;
  onReviewCard?: (word: string) => void;
  onSelectWord?: (word: string) => void;
  isSaved?: boolean;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  entry,
  onSaveWord,
  onReviewCard,
  onSelectWord,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingDialogue, setIsPlayingDialogue] = useState(false);
  const [playingSentenceIndex, setPlayingSentenceIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedMeaningIndex, setSelectedMeaningIndex] = useState(0);
  const [isBilingualMode, setIsBilingualMode] = useState(true);
  const [showDialogueVi, setShowDialogueVi] = useState(true);

  const [fsrsCard, setFsrsCard] = useState<FSRSFlashcard | null>(() =>
    getFSRSFlashcardByWord(entry.word)
  );

  // Sync FSRS Card state whenever entry changes
  React.useEffect(() => {
    setFsrsCard(getFSRSFlashcardByWord(entry.word));
    setSelectedMeaningIndex(0);
  }, [entry.word]);

  // Extract primary phonetic text
  const phoneticText = useMemo(() => {
    if (entry.phonetic) return entry.phonetic;
    const found = entry.phonetics?.find((p) => p.text && p.text.trim().length > 0);
    return found?.text || "";
  }, [entry]);

  // Extract first available audio url from phonetics list
  const audioUrl = useMemo(() => {
    const found = entry.phonetics?.find(
      (p) => p.audio && p.audio.trim().length > 0
    );
    return found?.audio || "";
  }, [entry]);

  // Find sample definition and example for contextual scenario
  const sampleDef = entry.meanings?.[0]?.definitions?.[0]?.definition;
  const sampleExp = entry.meanings?.[0]?.definitions?.find((d) => d.example)?.example;

  // Retrieve workplace scenario
  const scenario = useMemo(() => {
    return getWorkplaceScenario(entry.word, sampleDef, sampleExp);
  }, [entry.word, sampleDef, sampleExp]);

  // Play audio pronunciation of word
  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speechService.play(
      entry.word,
      audioUrl,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  // Play a specific example sentence via TTS
  const handlePlaySentenceAudio = (text: string, index: number) => {
    if (playingSentenceIndex === index) {
      speechService.stop();
      setPlayingSentenceIndex(null);
      return;
    }

    setPlayingSentenceIndex(index);
    speechService.play(
      text,
      undefined,
      () => setPlayingSentenceIndex(index),
      () => setPlayingSentenceIndex(null)
    );
  };

  // Play dialogue lines in sequence using TTS
  const handleToggleDialogueSpeech = async () => {
    if (isPlayingDialogue) {
      speechService.stop();
      setIsPlayingDialogue(false);
      return;
    }

    setIsPlayingDialogue(true);
    for (const item of scenario.dialogue) {
      const lineText = `${item.speaker} says: ${item.line}`;
      await speechService.play(lineText);
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    setIsPlayingDialogue(false);
  };

  const activeMeaning = entry.meanings?.[selectedMeaningIndex] || entry.meanings?.[0];
  const activePosInfo = getPartOfSpeechInfo(activeMeaning?.partOfSpeech);

  const handleToggleFSRSCard = () => {
    if (fsrsCard) {
      removeFSRSFlashcard(entry.word);
      setFsrsCard(null);
      if (onSaveWord) onSaveWord(entry.word, false);
    } else {
      const created = saveFSRSFlashcard({
        word: entry.word,
        phonetic: phoneticText,
        partOfSpeech: activeMeaning?.partOfSpeech,
        definition: sampleDef || "Workplace terminology",
        example: sampleExp,
        meaningVi: entry.translationVi || activeMeaning?.definitions?.[0]?.definitionVi,
        audioUrl,
      });
      setFsrsCard(created);
      if (onSaveWord) onSaveWord(entry.word, true);
    }
  };

  const handleCopyWord = () => {
    const textToCopy = `${entry.word} ${phoneticText}\n[${activePosInfo.vi}]: ${entry.translationVi || ""}\n${sampleDef || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Aggregate synonyms and antonyms for active meaning and entry
  const displaySynonyms = useMemo(() => {
    const set = new Set<string>();
    activeMeaning?.synonyms?.forEach((s) => set.add(s));
    entry.synonyms?.forEach((s) => set.add(s));
    set.delete(entry.word.toLowerCase());
    return Array.from(set).slice(0, 10);
  }, [activeMeaning, entry]);

  const displayAntonyms = useMemo(() => {
    const set = new Set<string>();
    activeMeaning?.antonyms?.forEach((a) => set.add(a));
    entry.antonyms?.forEach((a) => set.add(a));
    set.delete(entry.word.toLowerCase());
    return Array.from(set).slice(0, 10);
  }, [activeMeaning, entry]);

  const stateInfo = fsrsCard ? getFSRSStateInfo(fsrsCard.card.state) : null;
  const isDueNow = fsrsCard ? isCardDue(fsrsCard.card) : false;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white capitalize">
                  {entry.word}
                </h1>
                
                {/* Audio Pronunciation Button */}
                <button
                  onClick={handlePlayAudio}
                  className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm ${
                    isPlayingAudio
                      ? "bg-indigo-600 text-white scale-105 shadow-indigo-500/30 animate-pulse"
                      : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
                  }`}
                  title={isPlayingAudio ? "Dừng âm thanh" : "Nghe phát âm chuẩn"}
                  aria-label="Listen to pronunciation"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
              </div>

              {phoneticText && (
                <p className="mt-2 text-base font-mono text-slate-500 dark:text-slate-400 tracking-wide">
                  {phoneticText}
                </p>
              )}
            </div>

            {/* Action Buttons: Copy & Create FSRS Flashcard */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyWord}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Sao chép từ vựng và nghĩa"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </Button>

              <Button
                variant={fsrsCard ? "default" : "outline"}
                size="sm"
                onClick={handleToggleFSRSCard}
                className={`rounded-xl gap-1.5 transition-all cursor-pointer font-medium ${
                  fsrsCard
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 border-transparent"
                    : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>{fsrsCard ? "Đã lưu FSRS" : "Tạo thẻ FSRS"}</span>
              </Button>
            </div>
          </div>

          {/* Vietnamese Translation Highlight Banner */}
          {entry.translationVi && (
            <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-blue-50/80 dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-slate-900 border border-indigo-100/90 dark:border-indigo-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-500/30">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Nghĩa Tiếng Việt
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activePosInfo.badgeClass}`}>
                      {activePosInfo.vi} ({activePosInfo.abbr})
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                    {entry.translationVi}
                  </p>
                </div>
              </div>

              {/* Bilingual Mode Toggle Button */}
              <button
                type="button"
                onClick={() => setIsBilingualMode(!isBilingualMode)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 ${
                  isBilingualMode
                    ? "bg-indigo-600 text-white border-transparent shadow-sm shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                }`}
                title="Bật/Tắt chế độ hiển thị song ngữ Anh - Việt"
              >
                <Split className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Song ngữ</span>
                <span>{isBilingualMode ? "Bật" : "Tắt"}</span>
              </button>
            </div>
          )}

          {/* FSRS Learning Status Pill when card is saved */}
          {fsrsCard && stateInfo && (
            <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-slate-800/70 border border-indigo-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in-50">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${stateInfo.badgeClass}`}>
                  {stateInfo.label}
                </span>

                <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {isDueNow ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      Đến hạn ôn tập hôm nay
                    </span>
                  ) : (
                    <span>
                      Ôn tiếp theo: {formatIntervalPreview(fsrsCard.card.due)}
                    </span>
                  )}
                </span>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  (Đã ôn {fsrsCard.card.reps} lần • Độ ổn định {Math.round(fsrsCard.card.stability * 10) / 10}d)
                </span>
              </div>

              {onReviewCard && (
                <button
                  type="button"
                  onClick={() => onReviewCard(entry.word)}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Ôn tập thẻ này</span>
                </button>
              )}
            </div>
          )}

          {/* Part of Speech Badges / Tabs with Vietnamese Labels */}
          {entry.meanings && entry.meanings.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Phân loại từ loại ({entry.meanings.length} loại từ)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.meanings.map((meaning, idx) => {
                  const posInfo = getPartOfSpeechInfo(meaning.partOfSpeech);
                  const isSelected = selectedMeaningIndex === idx;

                  return (
                    <button
                      key={`${meaning.partOfSpeech}-${idx}`}
                      onClick={() => setSelectedMeaningIndex(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? `${posInfo.pillActiveClass} border-transparent`
                          : `${posInfo.pillInactiveClass} border-slate-200/70 dark:border-slate-800`
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : posInfo.dotColor}`} />
                      <span>{posInfo.vi}</span>
                      <span className="text-[10px] opacity-75 font-mono">({posInfo.abbr})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Definitions & Examples Section */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Languages className="w-4 h-4 text-indigo-500" />
                <span>
                  Định nghĩa &amp; Ngữ cảnh ({activePosInfo.vi} • {activePosInfo.en})
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {activeMeaning?.definitions.slice(0, 4).map((def, idx) => (
                <div
                  key={idx}
                  className="group rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-2.5 flex-1">
                      {/* English Definition */}
                      <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                        {def.definition}
                      </p>

                      {/* Vietnamese Definition (Bilingual View) */}
                      {isBilingualMode && def.definitionVi && (
                        <div className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100/60 dark:border-indigo-900/30 font-normal">
                          <span className="font-semibold text-indigo-700 dark:text-indigo-400">Dịch nghĩa: </span>
                          {def.definitionVi}
                        </div>
                      )}

                      {/* Example Sentence with Audio & Translation */}
                      {def.example && (
                        <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm italic text-slate-700 dark:text-slate-300 leading-relaxed">
                              &ldquo;{def.example}&rdquo;
                            </p>
                            <button
                              type="button"
                              onClick={() => handlePlaySentenceAudio(def.example!, idx)}
                              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer ${
                                playingSentenceIndex === idx
                                  ? "bg-indigo-600 text-white animate-pulse"
                                  : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              title="Nghe câu ví dụ"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Vietnamese Translation of Example */}
                          {isBilingualMode && def.exampleVi && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal border-t border-slate-100 dark:border-slate-700/40 pt-1.5">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">Dịch câu: </span>
                              {def.exampleVi}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Synonyms & Antonyms Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {/* Synonyms (Từ Đồng Nghĩa) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Từ đồng nghĩa (Synonyms)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  {displaySynonyms.length} từ
                </span>
              </div>

              {displaySynonyms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {displaySynonyms.map((syn) => (
                    <button
                      key={syn}
                      type="button"
                      onClick={() => onSelectWord?.(syn)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white hover:border-transparent transition-all shadow-sm cursor-pointer flex items-center gap-1 group"
                      title={`Bấm để tra cứu "${syn}"`}
                    >
                      <span>{syn}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 italic">
                  Không có từ đồng nghĩa trực tiếp cho từ loại này.
                </p>
              )}
            </div>

            {/* Antonyms (Từ Trái Nghĩa) */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Từ trái nghĩa (Antonyms)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  {displayAntonyms.length} từ
                </span>
              </div>

              {displayAntonyms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {displayAntonyms.map((ant) => (
                    <button
                      key={ant}
                      type="button"
                      onClick={() => onSelectWord?.(ant)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white hover:border-transparent transition-all shadow-sm cursor-pointer flex items-center gap-1 group"
                      title={`Bấm để tra cứu "${ant}"`}
                    >
                      <span>{ant}</span>
                      <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-600/70 dark:text-rose-400/60 italic">
                  Không có từ trái nghĩa trực tiếp cho từ vựng này.
                </p>
              )}
            </div>
          </div>

          {/* Workplace Scenario & Dialogue Box */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-indigo-500/10 to-purple-500/5 border border-indigo-100 dark:border-indigo-900/50 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/25">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {scenario.titleVi || scenario.title}
                  </h3>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Hội Thoại Ngữ Cảnh Công Sở &amp; Doanh Nghiệp
                  </span>
                </div>
              </div>

              {/* Action Buttons: Play Speech & Toggle Subtitles */}
              <div className="flex items-center gap-2">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setShowDialogueVi(!showDialogueVi)}
                  className="gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{showDialogueVi ? "Ẩn tiếng Việt" : "Hiện tiếng Việt"}</span>
                </Button>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={handleToggleDialogueSpeech}
                  className="gap-2 rounded-xl text-xs font-semibold"
                >
                  {isPlayingDialogue ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
                      <span>Dừng đoạn thoại</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current text-indigo-600" />
                      <span>Nghe đối thoại</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Context Description */}
            <div className="mb-4 bg-white/80 dark:bg-slate-900/60 p-3.5 rounded-xl border border-indigo-100/60 dark:border-indigo-950 space-y-1">
              <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Ngữ cảnh: </span>
                {scenario.contextDescriptionVi || scenario.contextDescription}
              </p>
              {scenario.contextDescriptionVi && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  En: {scenario.contextDescription}
                </p>
              )}
            </div>

            {/* Dialogue Turns */}
            <div className="space-y-3">
              {scenario.dialogue.map((turn, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-3.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-sm shadow-xs"
                >
                  <div className="min-w-[140px] flex items-center justify-between sm:justify-start gap-1.5 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {turn.speaker}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px]">
                      {turn.role}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                        &ldquo;{turn.line}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={() => speechService.play(`${turn.speaker} says: ${turn.line}`)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer transition-colors"
                        title="Nghe câu này"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {showDialogueVi && turn.lineVi && (
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 font-normal bg-indigo-50/50 dark:bg-indigo-950/40 px-2.5 py-1.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                        {turn.lineVi}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Video & Real Context Links (YouGlish & YouTube) */}
            <div className="mt-5 pt-4 border-t border-indigo-100/70 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <Video className="w-4 h-4 text-rose-500" />
                Xem người bản xứ nói &quot;{entry.word}&quot; trong video thực tế:
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={scenario.youGlishUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
                >
                  <span>YouGlish Clips</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={scenario.videoSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-all"
                >
                  <span>Business Video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer: Source and Information */}
        {entry.sourceUrls && entry.sourceUrls.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Free Dictionary API • FSRS-Ready • Song ngữ Anh - Việt</span>
            <a
              href={entry.sourceUrls[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-500 transition-colors flex items-center gap-1"
            >
              <span>Nguồn từ điển</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
