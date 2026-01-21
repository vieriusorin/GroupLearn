import type { LessonSession } from "@/domains/learning-path/aggregates/LessonSession";
import type { ISessionRepository } from "@/domains/learning-path/repositories/ISessionRepository";
import type { LessonId, UserId } from "@/domains/shared/types/branded-types";

/**
 * In-memory implementation of Session repository
 *
 * This stores active lesson sessions in memory. In production, you might
 * want to use Redis or another distributed cache for this.
 *
 * Note: Sessions are lost on server restart. For production, consider
 * implementing a Redis-based session repository.
 */
export class InMemorySessionRepository implements ISessionRepository {
  private sessions: Map<string, LessonSession> = new Map();

  /**
   * Generate session key
   */
  private getSessionKey(userId: UserId, lessonId: LessonId): string {
    return `${userId}:${lessonId}`;
  }

  async save(session: LessonSession, userId: UserId): Promise<void> {
    const key = this.getSessionKey(userId, session.lessonId);
    // Create a deep copy to avoid mutations
    // In a real implementation, you'd serialize/deserialize properly
    this.sessions.set(key, session);
  }

  async findByUserAndLesson(
    userId: UserId,
    lessonId: LessonId,
  ): Promise<LessonSession | null> {
    const key = this.getSessionKey(userId, lessonId);
    return this.sessions.get(key) || null;
  }

  async findByUser(userId: UserId): Promise<LessonSession[]> {
    const sessions: LessonSession[] = [];
    const prefix = `${userId}:`;

    for (const [key, session] of this.sessions.entries()) {
      if (key.startsWith(prefix)) {
        sessions.push(session);
      }
    }

    return sessions;
  }

  async delete(userId: UserId, lessonId: LessonId): Promise<void> {
    const key = this.getSessionKey(userId, lessonId);
    this.sessions.delete(key);
  }

  async deleteAllForUser(userId: UserId): Promise<void> {
    const prefix = `${userId}:`;
    const keysToDelete: string[] = [];

    for (const key of this.sessions.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.sessions.delete(key);
    }
  }
}
