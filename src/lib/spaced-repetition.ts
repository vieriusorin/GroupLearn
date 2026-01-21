import {
  addToStrugglingQueue,
  getLastReview,
  removeFromStrugglingQueue,
} from "./db-operations";
import type { ReviewMode } from "./types";

// Spaced repetition intervals in days
const INTERVALS = {
  INITIAL: 1,
  SECOND: 3,
  MASTERED: 7,
} as const;

/**
 * Calculate the next review date based on the flashcard's review history
 * Implements spaced repetition with 1, 3, 7 day intervals
 */
export async function calculateNextReviewDate(
  flashcardId: number,
  isCorrect: boolean,
): Promise<{
  intervalDays: number;
  nextReviewDate: string;
}> {
  const lastReview = await getLastReview(flashcardId);

  // First time reviewing this card
  if (!lastReview) {
    const nextDate = addDays(new Date(), INTERVALS.INITIAL);
    return {
      intervalDays: INTERVALS.INITIAL,
      nextReviewDate: nextDate.toISOString().split("T")[0],
    };
  }

  // If incorrect, reset to initial interval
  if (!isCorrect) {
    const nextDate = addDays(new Date(), INTERVALS.INITIAL);
    return {
      intervalDays: INTERVALS.INITIAL,
      nextReviewDate: nextDate.toISOString().split("T")[0],
    };
  }

  // If correct, progress through intervals: 1 -> 3 -> 7
  let nextInterval: number;

  if (lastReview.interval_days === INTERVALS.INITIAL) {
    nextInterval = INTERVALS.SECOND;
  } else if (lastReview.interval_days === INTERVALS.SECOND) {
    nextInterval = INTERVALS.MASTERED;
  } else {
    // Already mastered, keep at 7 days
    nextInterval = INTERVALS.MASTERED;
  }

  const nextDate = addDays(new Date(), nextInterval);
  return {
    intervalDays: nextInterval,
    nextReviewDate: nextDate.toISOString().split("T")[0],
  };
}

/**
 * Record a review and update the struggling queue if needed
 */
export async function recordReview(
  flashcardId: number,
  _reviewMode: ReviewMode,
  isCorrect: boolean,
): Promise<void> {
  const { intervalDays, nextReviewDate } = await calculateNextReviewDate(
    flashcardId,
    isCorrect,
  );

  // NOTE: creation of review records has moved to the new review domain/use-cases.
  // This legacy helper only maintains the struggling queue flags.

  // Update struggling queue
  if (!isCorrect) {
    await addToStrugglingQueue(flashcardId);
  } else {
    // If they got it correct, check if we should remove from struggling queue
    const lastReview = await getLastReview(flashcardId);

    // Remove from struggling queue if they've progressed to 3+ day interval
    if (lastReview && lastReview.interval_days >= INTERVALS.SECOND) {
      await removeFromStrugglingQueue(flashcardId);
    }
  }
}

/**
 * Check if a flashcard is due for review
 */
export async function isCardDueForReview(
  flashcardId: number,
): Promise<boolean> {
  const lastReview = await getLastReview(flashcardId);

  // Never reviewed before - it's due
  if (!lastReview) {
    return true;
  }

  const today = new Date().toISOString().split("T")[0];
  return lastReview.next_review_date <= today;
}

/**
 * Get the mastery level of a flashcard based on its review history
 */
export async function getCardMasteryLevel(
  flashcardId: number,
): Promise<"new" | "learning" | "mastered"> {
  const lastReview = await getLastReview(flashcardId);

  if (!lastReview) {
    return "new";
  }

  if (
    lastReview.interval_days === INTERVALS.MASTERED &&
    lastReview.is_correct
  ) {
    return "mastered";
  }

  return "learning";
}

/**
 * Utility function to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
