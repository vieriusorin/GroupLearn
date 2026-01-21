import type {
  FlashcardId,
  ReviewHistoryId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { ReviewHistoryRecord } from "../services/SpacedRepetitionService";

/**
 * Review history repository interface
 *
 * Defines the contract for review history data access.
 * Tracks spaced repetition review records for flashcards.
 */
export interface IReviewHistoryRepository {
  /**
   * Find review history by ID
   */
  findById(id: ReviewHistoryId): Promise<ReviewHistoryRecord | null>;

  /**
   * Find the most recent review for a flashcard by a user
   */
  findLastReview(
    userId: UserId,
    flashcardId: FlashcardId,
  ): Promise<ReviewHistoryRecord | null>;

  /**
   * Find all review history for a user
   */
  findByUser(userId: UserId): Promise<ReviewHistoryRecord[]>;

  /**
   * Find all review history for a flashcard
   */
  findByFlashcard(flashcardId: FlashcardId): Promise<ReviewHistoryRecord[]>;

  /**
   * Find all review history for a user and flashcard
   */
  findByUserAndFlashcard(
    userId: UserId,
    flashcardId: FlashcardId,
  ): Promise<ReviewHistoryRecord[]>;

  /**
   * Find flashcards due for review for a user
   * (where next_review_date <= today)
   */
  findDueFlashcards(userId: UserId, limit?: number): Promise<FlashcardId[]>;

  /**
   * Count due flashcards for a user
   */
  countDueFlashcards(userId: UserId): Promise<number>;

  /**
   * Save a new review history record
   */
  save(record: ReviewHistoryRecord): Promise<ReviewHistoryRecord>;

  /**
   * Delete review history by ID
   */
  delete(id: ReviewHistoryId): Promise<void>;

  /**
   * Delete all review history for a user
   */
  deleteByUser(userId: UserId): Promise<void>;

  /**
   * Delete all review history for a flashcard
   */
  deleteByFlashcard(flashcardId: FlashcardId): Promise<void>;
}
