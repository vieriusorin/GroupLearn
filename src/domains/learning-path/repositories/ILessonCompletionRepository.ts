import type {
  LessonCompletionId,
  LessonId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { LessonCompletion } from "../entities/LessonCompletion";

/**
 * Repository interface for LessonCompletion entities
 *
 * This interface defines the contract for persistence operations
 * on lesson completion records. Implementations might use SQL databases,
 * NoSQL databases, or other storage mechanisms.
 */
export interface ILessonCompletionRepository {
  /**
   * Find a lesson completion by its ID
   *
   * @param id The completion record ID
   * @returns The lesson completion or null if not found
   */
  findById(id: LessonCompletionId): Promise<LessonCompletion | null>;

  /**
   * Find all completion records for a specific user
   *
   * @param userId The user ID
   * @returns Array of lesson completions
   */
  findByUserId(userId: UserId): Promise<LessonCompletion[]>;

  /**
   * Find all completion records for a specific lesson
   *
   * @param lessonId The lesson ID
   * @returns Array of lesson completions
   */
  findByLessonId(lessonId: LessonId): Promise<LessonCompletion[]>;

  /**
   * Find completion records for a user and specific lesson
   *
   * @param userId The user ID
   * @param lessonId The lesson ID
   * @returns Array of lesson completions (can be multiple if lesson retried)
   */
  findByUserAndLesson(
    userId: UserId,
    lessonId: LessonId,
  ): Promise<LessonCompletion[]>;

  /**
   * Find the best (highest accuracy) completion for a user and lesson
   *
   * @param userId The user ID
   * @param lessonId The lesson ID
   * @returns The best completion or null if never completed
   */
  findBestCompletion(
    userId: UserId,
    lessonId: LessonId,
  ): Promise<LessonCompletion | null>;

  /**
   * Find recent completions for a user
   *
   * @param userId The user ID
   * @param limit Maximum number of records to return
   * @returns Array of recent lesson completions
   */
  findRecentByUser(userId: UserId, limit: number): Promise<LessonCompletion[]>;

  /**
   * Count how many times a user has completed a specific lesson
   *
   * @param userId The user ID
   * @param lessonId The lesson ID
   * @returns Number of times completed
   */
  countCompletions(userId: UserId, lessonId: LessonId): Promise<number>;

  /**
   * Save a lesson completion (create or update)
   *
   * @param completion The lesson completion to save
   * @returns The saved lesson completion with ID assigned
   */
  save(completion: LessonCompletion): Promise<LessonCompletion>;

  /**
   * Delete a lesson completion
   *
   * @param id The completion record ID
   */
  delete(id: LessonCompletionId): Promise<void>;

  /**
   * Calculate average accuracy for a user across all lessons
   *
   * @param userId The user ID
   * @returns Average accuracy percentage
   */
  calculateAverageAccuracy(userId: UserId): Promise<number>;

  /**
   * Get total XP earned by a user from lesson completions
   *
   * @param userId The user ID
   * @returns Total XP earned
   */
  getTotalXPEarned(userId: UserId): Promise<number>;

  /**
   * Check if a user has completed a lesson
   *
   * @param userId The user ID
   * @param lessonId The lesson ID
   * @returns True if completed at least once
   */
  hasCompleted(userId: UserId, lessonId: LessonId): Promise<boolean>;
}
