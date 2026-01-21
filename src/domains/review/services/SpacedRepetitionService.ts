import type {
  FlashcardId,
  ReviewHistoryId,
  UserId,
} from "@/domains/shared/types/branded-types";
import { ReviewInterval } from "../value-objects/ReviewInterval";

/**
 * Review history record for spaced repetition calculations
 * Full record with all database fields
 */
export interface ReviewHistoryRecord {
  id?: ReviewHistoryId;
  userId: UserId;
  flashcardId: FlashcardId;
  reviewMode: "flashcard" | "quiz" | "recall";
  isCorrect: boolean;
  reviewDate: Date;
  nextReviewDate: Date;
  intervalDays: number;
}

/**
 * Spaced Repetition Service
 *
 * Domain service responsible for calculating review intervals based on
 * the spaced repetition algorithm. Implements a simplified SM-2 algorithm.
 */
export class SpacedRepetitionService {
  /**
   * Calculate the next review interval based on review history
   *
   * Uses a progressive interval system:
   * - First review: 1 day
   * - Second review: 3 days
   * - Third review: 7 days
   * - Fourth review: 14 days
   * - Fifth+ review: 30 days
   *
   * If the answer is incorrect, interval resets to 1 day.
   *
   * @param previousReviews Array of previous review records
   * @param wasCorrect Whether the current review was correct
   * @returns Next review interval
   */
  calculateNextInterval(
    previousReviews: Pick<ReviewHistoryRecord, "isCorrect">[],
    wasCorrect: boolean,
  ): ReviewInterval {
    // If incorrect, reset to first interval
    if (!wasCorrect) {
      return ReviewInterval.firstReview();
    }

    // Count consecutive successful reviews
    const successfulReviews =
      this.countConsecutiveSuccessfulReviews(previousReviews);

    // Progressive interval based on successful reviews
    switch (successfulReviews) {
      case 0:
        return ReviewInterval.firstReview(); // 1 day
      case 1:
        return ReviewInterval.secondReview(); // 3 days
      case 2:
        return ReviewInterval.thirdReview(); // 7 days
      case 3:
        return ReviewInterval.fourthReview(); // 14 days
      default:
        return ReviewInterval.mastered(); // 30 days
    }
  }

  /**
   * Calculate interval using ease factor (SM-2 algorithm)
   *
   * @param previousInterval Previous interval in days
   * @param easeFactor Ease factor (1.3 - 2.5)
   * @param wasCorrect Whether the answer was correct
   * @returns Next review interval
   */
  calculateWithEaseFactor(
    previousInterval: ReviewInterval,
    easeFactor: number,
    wasCorrect: boolean,
  ): ReviewInterval {
    if (!wasCorrect) {
      return ReviewInterval.firstReview();
    }

    // Clamp ease factor between 1.3 and 2.5
    const clampedEF = Math.max(1.3, Math.min(2.5, easeFactor));

    // Calculate next interval
    const previousDays = previousInterval.getDays();
    let nextDays: number;

    if (previousDays === 1) {
      nextDays = 3; // First review -> second review
    } else if (previousDays === 3) {
      nextDays = 7; // Second review -> third review
    } else {
      // Apply ease factor
      nextDays = Math.ceil(previousDays * clampedEF);
    }

    return ReviewInterval.fromDays(nextDays);
  }

  /**
   * Determine if a card should be marked as struggling
   *
   * Criteria:
   * - Failed 3+ times in a row
   * - OR failure rate > 50% with at least 5 attempts
   *
   * @param failureCount Number of consecutive failures
   * @param totalAttempts Total number of attempts
   * @returns True if card should be marked as struggling
   */
  shouldMarkAsStruggling(failureCount: number, totalAttempts: number): boolean {
    // Failed 3+ times consecutively
    if (failureCount >= 3) {
      return true;
    }

    // Failure rate > 50% with sufficient attempts
    if (totalAttempts >= 5) {
      const _successfulAttempts = totalAttempts - failureCount;
      const failureRate = failureCount / totalAttempts;
      return failureRate > 0.5;
    }

    return false;
  }

  /**
   * Calculate ease factor based on performance quality
   *
   * Quality scale:
   * - 5: Perfect response (easy)
   * - 4: Correct with hesitation
   * - 3: Correct with difficulty
   * - 2: Incorrect but remembered with hint
   * - 1: Incorrect but familiar
   * - 0: Complete blackout
   *
   * @param currentEaseFactor Current ease factor
   * @param quality Quality of response (0-5)
   * @returns Updated ease factor
   */
  calculateEaseFactor(currentEaseFactor: number, quality: number): number {
    const newEF =
      currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    // Clamp between 1.3 and 2.5
    return Math.max(1.3, Math.min(2.5, newEF));
  }

  /**
   * Count consecutive successful reviews from the end of history
   */
  private countConsecutiveSuccessfulReviews(
    reviews: Pick<ReviewHistoryRecord, "isCorrect">[],
  ): number {
    let count = 0;

    // Count from most recent backwards
    for (let i = reviews.length - 1; i >= 0; i--) {
      if (reviews[i].isCorrect) {
        count++;
      } else {
        break; // Stop at first failure
      }
    }

    return count;
  }

  /**
   * Determine if a card is due for review
   *
   * @param lastReviewDate Date of last review
   * @param intervalDays Interval in days
   * @param currentDate Current date (defaults to now)
   * @returns True if card is due for review
   */
  isDueForReview(
    lastReviewDate: Date,
    intervalDays: number,
    currentDate: Date = new Date(),
  ): boolean {
    const nextReviewDate = new Date(lastReviewDate);
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

    return currentDate >= nextReviewDate;
  }

  /**
   * Calculate days until next review
   *
   * @param lastReviewDate Date of last review
   * @param intervalDays Interval in days
   * @param currentDate Current date (defaults to now)
   * @returns Days until next review (negative if overdue)
   */
  daysUntilNextReview(
    lastReviewDate: Date,
    intervalDays: number,
    currentDate: Date = new Date(),
  ): number {
    const nextReviewDate = new Date(lastReviewDate);
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.ceil(
      (nextReviewDate.getTime() - currentDate.getTime()) / msPerDay,
    );

    return daysDiff;
  }
}
