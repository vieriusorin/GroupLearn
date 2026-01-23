import {
  addToStrugglingQueueCommand,
  removeFromStrugglingQueueCommand,
} from "@/commands";
import type { ReviewModeType } from "@/infrastructure/database/schema";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import { getLastReviewQuery } from "@/queries";

const INTERVALS = {
  INITIAL: 1,
  SECOND: 3,
  MASTERED: 7,
} as const;

export async function calculateNextReviewDate(
  flashcardId: number,
  isCorrect: boolean,
): Promise<{
  intervalDays: number;
  nextReviewDate: string;
}> {
  const query = getLastReviewQuery(flashcardId);
  const lastReview = await queryHandlers.review.getLastReview.execute(query);

  if (!lastReview) {
    const nextDate = addDays(new Date(), INTERVALS.INITIAL);
    return {
      intervalDays: INTERVALS.INITIAL,
      nextReviewDate: nextDate.toISOString().split("T")[0],
    };
  }
  if (!isCorrect) {
    const nextDate = addDays(new Date(), INTERVALS.INITIAL);
    return {
      intervalDays: INTERVALS.INITIAL,
      nextReviewDate: nextDate.toISOString().split("T")[0],
    };
  }

  let nextInterval: number;

  if (lastReview.intervalDays === INTERVALS.INITIAL) {
    nextInterval = INTERVALS.SECOND;
  } else if (lastReview.intervalDays === INTERVALS.SECOND) {
    nextInterval = INTERVALS.MASTERED;
  } else {
    nextInterval = INTERVALS.MASTERED;
  }

  const nextDate = addDays(new Date(), nextInterval);
  return {
    intervalDays: nextInterval,
    nextReviewDate: nextDate.toISOString().split("T")[0],
  };
}

export async function recordReview(
  flashcardId: number,
  _reviewMode: ReviewModeType,
  isCorrect: boolean,
): Promise<void> {
  if (!isCorrect) {
    const command = addToStrugglingQueueCommand(flashcardId);
    await commandHandlers.review.addToStrugglingQueue.execute(command);
  } else {
    const query = getLastReviewQuery(flashcardId);
    const lastReview = await queryHandlers.review.getLastReview.execute(query);

    if (lastReview && lastReview.intervalDays >= INTERVALS.SECOND) {
      const command = removeFromStrugglingQueueCommand(flashcardId);
      await commandHandlers.review.removeFromStrugglingQueue.execute(command);
    }
  }
}

export async function isCardDueForReview(
  flashcardId: number,
): Promise<boolean> {
  const query = getLastReviewQuery(flashcardId);
  const lastReview = await queryHandlers.review.getLastReview.execute(query);

  if (!lastReview) {
    return true;
  }

  const today = new Date().toISOString().split("T")[0];
  const nextReviewDate =
    lastReview.nextReviewDate instanceof Date
      ? lastReview.nextReviewDate.toISOString().split("T")[0]
      : lastReview.nextReviewDate;
  return nextReviewDate <= today;
}

export async function getCardMasteryLevel(
  flashcardId: number,
): Promise<"new" | "learning" | "mastered"> {
  const query = getLastReviewQuery(flashcardId);
  const lastReview = await queryHandlers.review.getLastReview.execute(query);

  if (!lastReview) {
    return "new";
  }

  if (lastReview.intervalDays === INTERVALS.MASTERED && lastReview.isCorrect) {
    return "mastered";
  }

  return "learning";
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
