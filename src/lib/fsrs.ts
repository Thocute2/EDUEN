import {
  fsrs,
  createEmptyCard,
  Card,
  Rating,
  State,
  RecordLog,
  RecordLogItem,
} from "ts-fsrs";

export type FSRSRating = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

// Initialize FSRS with standard parameters
export const fsrsInstance = fsrs();

/**
 * Creates a new empty FSRS card initialized with current date
 */
export function createNewFSRSCard(date: Date = new Date()): Card {
  return createEmptyCard(date);
}

/**
 * Properly deserializes a Card stored in JSON (which converted Date fields to strings)
 */
export function deserializeCard(rawCard: Partial<Card> | undefined): Card {
  const defaultCard = createEmptyCard();
  if (!rawCard) return defaultCard;

  return {
    ...defaultCard,
    ...rawCard,
    due: rawCard.due ? new Date(rawCard.due) : new Date(),
    last_review: rawCard.last_review ? new Date(rawCard.last_review) : undefined,
  };
}

/**
 * Checks if a card is currently due for spaced repetition review
 */
export function isCardDue(card: Card, now: Date = new Date()): boolean {
  const dueTime = new Date(card.due).getTime();
  const currentTime = now.getTime();
  // Card is due if due timestamp is less than or equal to current time, or if card is brand new (reps === 0)
  return dueTime <= currentTime || card.reps === 0;
}

/**
 * Formats a duration or future date into a user-friendly Vietnamese interval string
 */
export function formatIntervalPreview(due: Date, now: Date = new Date()): string {
  const diffMs = due.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes <= 1) return "< 1 phút";
  if (diffMinutes < 60) return `${diffMinutes} phút`;
  if (diffHours < 24) return `${diffHours} giờ`;
  if (diffDays <= 1) return "1 ngày";
  if (diffDays < 30) return `${diffDays} ngày`;
  const diffMonths = Math.round(diffDays / 30);
  return `${diffMonths} tháng`;
}

export interface IntervalPreview {
  rating: FSRSRating;
  label: string;
  intervalText: string;
  card: Card;
}

/**
 * Generates the preview of the next interval for each of the 4 FSRS ratings
 */
export function getCardIntervalPreviews(
  card: Card,
  now: Date = new Date()
): Record<FSRSRating, IntervalPreview> {
  const cleanCard = deserializeCard(card);
  const schedulingCards = fsrsInstance.repeat(cleanCard, now);

  return {
    [Rating.Again]: {
      rating: Rating.Again,
      label: "Quên (Again)",
      intervalText: formatIntervalPreview(schedulingCards[Rating.Again].card.due, now),
      card: schedulingCards[Rating.Again].card,
    },
    [Rating.Hard]: {
      rating: Rating.Hard,
      label: "Khó (Hard)",
      intervalText: formatIntervalPreview(schedulingCards[Rating.Hard].card.due, now),
      card: schedulingCards[Rating.Hard].card,
    },
    [Rating.Good]: {
      rating: Rating.Good,
      label: "Nhớ (Good)",
      intervalText: formatIntervalPreview(schedulingCards[Rating.Good].card.due, now),
      card: schedulingCards[Rating.Good].card,
    },
    [Rating.Easy]: {
      rating: Rating.Easy,
      label: "Dễ (Easy)",
      intervalText: formatIntervalPreview(schedulingCards[Rating.Easy].card.due, now),
      card: schedulingCards[Rating.Easy].card,
    },
  };
}

/**
 * Calculates next card state given a rating and current time
 */
export function scheduleReview(
  card: Card,
  rating: FSRSRating,
  now: Date = new Date()
): RecordLogItem {
  const cleanCard = deserializeCard(card);
  const schedulingCards = fsrsInstance.repeat(cleanCard, now);
  return schedulingCards[rating];
}

/**
 * Human-readable Vietnamese label and style for FSRS state
 */
export function getFSRSStateInfo(state: State): {
  label: string;
  color: string;
  badgeClass: string;
} {
  switch (state) {
    case State.New:
      return {
        label: "Thẻ Mới",
        color: "#3b82f6",
        badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      };
    case State.Learning:
      return {
        label: "Đang Học",
        color: "#f59e0b",
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      };
    case State.Review:
      return {
        label: "Cần Ôn",
        color: "#10b981",
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      };
    case State.Relearning:
      return {
        label: "Học Lại",
        color: "#ef4444",
        badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      };
    default:
      return {
        label: "Thẻ Mới",
        color: "#6b7280",
        badgeClass: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800",
      };
  }
}
