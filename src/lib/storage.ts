/**
 * LocalStorage management for Spaced Repetition (ts-fsrs) Flashcards & Word Bank (MVP)
 */

import { Card, State } from "ts-fsrs";
import {
  createNewFSRSCard,
  deserializeCard,
  isCardDue,
  scheduleReview,
  FSRSRating,
} from "./fsrs";

const STORAGE_KEY = "eduen_fsrs_flashcards";
const LEGACY_STORAGE_KEY = "eduen_saved_words";

export interface FSRSFlashcard {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  meaningVi?: string;
  audioUrl?: string;
  card: Card; // ts-fsrs Card object (due, stability, difficulty, state, reps...)
  createdAt: string;
  lastReview?: string;
}

export interface SavedWordItem {
  word: string;
  savedAt: string;
}

/**
 * Migration helper: loads cards and migrates legacy saved words if needed
 */
function loadAndMigrateCards(): FSRSFlashcard[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: FSRSFlashcard[] = JSON.parse(raw);
      return parsed.map((item) => ({
        ...item,
        card: deserializeCard(item.card),
      }));
    }

    // Check legacy storage
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const legacyItems: SavedWordItem[] = JSON.parse(legacyRaw);
      const migrated: FSRSFlashcard[] = legacyItems.map((item) => ({
        id: `card_${item.word.toLowerCase()}_${Date.now()}`,
        word: item.word.toLowerCase(),
        definition: "Workplace vocabulary term",
        card: createNewFSRSCard(new Date(item.savedAt)),
        createdAt: item.savedAt || new Date().toISOString(),
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Persist cards to localStorage
 */
function saveCardsToStorage(cards: FSRSFlashcard[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    // Also keep legacy key synced for fallback
    const legacy: SavedWordItem[] = cards.map((c) => ({
      word: c.word,
      savedAt: c.createdAt,
    }));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(legacy));
  } catch {
    // Storage quota or error handling
  }
}

/**
 * Retrieve all FSRS Flashcards
 */
export function getFSRSFlashcards(): FSRSFlashcard[] {
  return loadAndMigrateCards();
}

/**
 * Get a specific flashcard by word
 */
export function getFSRSFlashcardByWord(word: string): FSRSFlashcard | null {
  const cards = getFSRSFlashcards();
  const normalized = word.trim().toLowerCase();
  return cards.find((c) => c.word.toLowerCase() === normalized) || null;
}

/**
 * Create or update an FSRS Flashcard
 */
export function saveFSRSFlashcard(cardData: {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  meaningVi?: string;
  audioUrl?: string;
  card?: Card;
}): FSRSFlashcard {
  const cards = getFSRSFlashcards();
  const normalized = cardData.word.trim().toLowerCase();
  const index = cards.findIndex((c) => c.word.toLowerCase() === normalized);

  let targetCard: FSRSFlashcard;

  if (index >= 0) {
    // Update existing
    targetCard = {
      ...cards[index],
      ...cardData,
      word: normalized,
      card: cardData.card
        ? deserializeCard(cardData.card)
        : cards[index].card,
    };
    cards[index] = targetCard;
  } else {
    // Create new
    targetCard = {
      id: `fsrs_${normalized}_${Date.now()}`,
      word: normalized,
      phonetic: cardData.phonetic || "",
      partOfSpeech: cardData.partOfSpeech || "",
      definition: cardData.definition || "Workplace terminology",
      example: cardData.example || "",
      meaningVi: cardData.meaningVi || "",
      audioUrl: cardData.audioUrl || "",
      card: cardData.card ? deserializeCard(cardData.card) : createNewFSRSCard(),
      createdAt: new Date().toISOString(),
    };
    cards.unshift(targetCard);
  }

  saveCardsToStorage(cards);
  return targetCard;
}

/**
 * Remove an FSRS flashcard
 */
export function removeFSRSFlashcard(word: string): boolean {
  const cards = getFSRSFlashcards();
  const normalized = word.trim().toLowerCase();
  const filtered = cards.filter((c) => c.word.toLowerCase() !== normalized);

  if (filtered.length !== cards.length) {
    saveCardsToStorage(filtered);
    return true;
  }
  return false;
}

/**
 * Record a user review rating for an FSRS flashcard using ts-fsrs algorithm
 */
export function recordCardReview(
  word: string,
  rating: FSRSRating,
  reviewTime: Date = new Date()
): FSRSFlashcard | null {
  const cards = getFSRSFlashcards();
  const normalized = word.trim().toLowerCase();
  const index = cards.findIndex((c) => c.word.toLowerCase() === normalized);

  if (index === -1) return null;

  const current = cards[index];
  const scheduleResult = scheduleReview(current.card, rating, reviewTime);

  const updated: FSRSFlashcard = {
    ...current,
    card: scheduleResult.card,
    lastReview: reviewTime.toISOString(),
  };

  cards[index] = updated;
  saveCardsToStorage(cards);
  return updated;
}

/**
 * Get all cards currently due for review
 */
export function getDueFSRSFlashcards(): FSRSFlashcard[] {
  const cards = getFSRSFlashcards();
  const now = new Date();
  return cards.filter((c) => isCardDue(c.card, now));
}

/**
 * Get FSRS statistics for learning dashboard
 */
export function getFSRSStats(): {
  total: number;
  due: number;
  newCards: number;
  learning: number;
  review: number;
  mastered: number;
} {
  const cards = getFSRSFlashcards();
  const now = new Date();

  let due = 0;
  let newCards = 0;
  let learning = 0;
  let review = 0;
  let mastered = 0;

  for (const c of cards) {
    if (isCardDue(c.card, now)) due++;

    switch (c.card.state) {
      case State.New:
        newCards++;
        break;
      case State.Learning:
      case State.Relearning:
        learning++;
        break;
      case State.Review:
        // Consider a card mastered if stability is high (e.g. > 15 days interval)
        if (c.card.stability >= 14) {
          mastered++;
        } else {
          review++;
        }
        break;
    }
  }

  return {
    total: cards.length,
    due,
    newCards,
    learning,
    review,
    mastered,
  };
}

/**
 * Backward compatibility helpers
 */
export function isWordSaved(word: string): boolean {
  if (typeof window === "undefined") return false;
  const cards = getFSRSFlashcards();
  const normalized = word.trim().toLowerCase();
  return cards.some((w) => w.word.toLowerCase() === normalized);
}

export function toggleSaveWord(
  word: string,
  extraData?: Partial<FSRSFlashcard>
): boolean {
  const normalized = word.trim().toLowerCase();
  if (isWordSaved(normalized)) {
    removeFSRSFlashcard(normalized);
    return false;
  } else {
    saveFSRSFlashcard({
      word: normalized,
      definition: extraData?.definition || "Workplace terminology",
      phonetic: extraData?.phonetic,
      partOfSpeech: extraData?.partOfSpeech,
      example: extraData?.example,
      audioUrl: extraData?.audioUrl,
      meaningVi: extraData?.meaningVi,
    });
    return true;
  }
}

export function getSavedWords(): SavedWordItem[] {
  const cards = getFSRSFlashcards();
  return cards.map((c) => ({
    word: c.word,
    savedAt: c.createdAt,
  }));
}
