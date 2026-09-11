export interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
}

export interface Definition {
  definition: string;
  definitionVi?: string;
  example?: string;
  exampleVi?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  partOfSpeechVi?: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  translationVi?: string;
  synonyms?: string[];
  antonyms?: string[];
  sourceUrls?: string[];
}

export interface WorkplaceDialogueLine {
  speaker: string;
  role: string;
  line: string;
  lineVi?: string;
}

export interface WorkplaceScenario {
  title: string;
  titleVi?: string;
  contextDescription: string;
  contextDescriptionVi?: string;
  dialogue: WorkplaceDialogueLine[];
  videoSearchUrl: string;
  youGlishUrl: string;
}

export interface WordSuggestion {
  word: string;
  pos?: string;
  meaningVi: string;
  type: "primary" | "synonym" | "related";
  badge?: string;
  source?: string;
}

export interface SuggestionResponse {
  query: string;
  isVietnamese: boolean;
  suggestions: WordSuggestion[];
}

export interface TranslationRequest {
  text?: string;
  texts?: string[];
  sl?: string; // source language: 'auto' | 'en' | 'vi'
  tl?: string; // target language: 'vi' | 'en'
}

export interface TranslationResponse {
  translatedText?: string;
  translatedTexts?: string[];
  detectedLang?: string;
  error?: string;
}

