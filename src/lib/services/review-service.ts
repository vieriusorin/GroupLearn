import {
  getCurrentStreak,
  getDueFlashcards,
  getStrugglingCards,
  getTodayReviewCount,
  isCardStruggling,
} from "../db-operations";
import type { Flashcard, StrugglingCard } from "../types";

/**
 * Review Service
 * Handles business logic for spaced repetition and review sessions
 */
export class ReviewService {
  /**
   * Get flashcards due for review
   */
  static async getDueCards(limit?: number): Promise<Flashcard[]> {
    return getDueFlashcards(limit);
  }

  /**
   * Get cards in the struggling queue
   */
  static async getStrugglingCards(): Promise<StrugglingCard[]> {
    return getStrugglingCards();
  }

  /**
   * Get today's review count
   */
  static async getTodayCount(): Promise<number> {
    return getTodayReviewCount();
  }

  /**
   * Get current review streak
   */
  static async getCurrentStreak(): Promise<number> {
    return getCurrentStreak();
  }

  /**
   * Get review statistics
   */
  static async getStats(): Promise<{
    dueCount: number;
    strugglingCount: number;
    todayCount: number;
    currentStreak: number;
  }> {
    const [dueCards, strugglingCards, todayCount, currentStreak] =
      await Promise.all([
        ReviewService.getDueCards(),
        ReviewService.getStrugglingCards(),
        ReviewService.getTodayCount(),
        ReviewService.getCurrentStreak(),
      ]);

    return {
      dueCount: dueCards.length,
      strugglingCount: strugglingCards.length,
      todayCount,
      currentStreak,
    };
  }

  /**
   * Check if a card is in the struggling queue
   */
  static async isCardStruggling(flashcardId: number): Promise<boolean> {
    return isCardStruggling(flashcardId);
  }
}
