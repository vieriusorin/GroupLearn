import type {
  Flashcard,
  StrugglingQueue,
} from "@/infrastructure/database/schema";
import { queryHandlers } from "@/infrastructure/di/container";
import {
  getCurrentStreakQuery,
  getDueFlashcardsLegacyQuery,
  getStrugglingCardsQuery,
  getTodayReviewCountQuery,
  isCardStrugglingQuery,
} from "@/queries";

/**
 * Review Service
 * Handles business logic for spaced repetition and review sessions
 */
export class ReviewService {
  /**
   * Get flashcards due for review (legacy, global)
   */
  static async getDueCards(limit?: number): Promise<Flashcard[]> {
    const query = getDueFlashcardsLegacyQuery(limit);
    return await queryHandlers.review.getDueFlashcardsLegacy.execute(query);
  }

  /**
   * Get cards in the struggling queue (legacy, global)
   */
  static async getStrugglingCards(): Promise<StrugglingQueue[]> {
    // Note: This is a legacy global query. The new GetStrugglingCards query is user-specific.
    // For now, we'll use the legacy handler which returns global struggling cards.
    // TODO: Consider deprecating this method or making it user-specific.
    const query = getStrugglingCardsQuery(""); // Empty userId for legacy
    const result = await queryHandlers.review.getStrugglingCards.execute(query);
    return result.cards.map((card) => ({
      id: 0, // StrugglingQueue doesn't have id in the result
      flashcardId: card.id,
      timesFailed: card.timesFailed,
      lastFailedAt: card.lastFailedAt ? new Date(card.lastFailedAt) : null,
      addedAt: card.addedAt ? new Date(card.addedAt) : new Date(),
    })) as StrugglingQueue[];
  }

  /**
   * Get today's review count (legacy, global)
   */
  static async getTodayCount(): Promise<number> {
    const query = getTodayReviewCountQuery();
    return await queryHandlers.review.getTodayReviewCount.execute(query);
  }

  /**
   * Get current review streak (legacy, global)
   */
  static async getCurrentStreak(): Promise<number> {
    const query = getCurrentStreakQuery();
    return await queryHandlers.review.getCurrentStreak.execute(query);
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
    const query = isCardStrugglingQuery(flashcardId);
    return await queryHandlers.review.isCardStruggling.execute(query);
  }
}
