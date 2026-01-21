import type { LessonId, UserId } from "@/domains/shared/types/branded-types";
import type { LessonSession } from "../aggregates/LessonSession";

/**
 * Repository interface for managing active lesson sessions
 *
 * Sessions are stored temporarily (in-memory or cache) and represent
 * an active lesson that a user is currently playing.
 */
export interface ISessionRepository {
  /**
   * Save an active session
   */
  save(session: LessonSession, userId: UserId): Promise<void>;

  /**
   * Find active session for a user and lesson
   */
  findByUserAndLesson(
    userId: UserId,
    lessonId: LessonId,
  ): Promise<LessonSession | null>;

  /**
   * Find all active sessions for a user
   */
  findByUser(userId: UserId): Promise<LessonSession[]>;

  /**
   * Delete a session (when lesson is completed or abandoned)
   */
  delete(userId: UserId, lessonId: LessonId): Promise<void>;

  /**
   * Delete all sessions for a user
   */
  deleteAllForUser(userId: UserId): Promise<void>;
}
