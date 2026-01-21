import type { Hearts } from "@/domains/gamification/value-objects/Hearts";
import type { XP } from "@/domains/gamification/value-objects/XP";
import { DomainError } from "@/domains/shared/errors";
import type {
  LessonCompletionId,
  LessonId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { Accuracy } from "../value-objects/Accuracy";

/**
 * LessonCompletion Entity
 *
 * Represents a historical record of a user completing a lesson.
 * This is used for tracking progress, generating reports, and calculating statistics.
 *
 * Domain Invariants:
 * - User ID and Lesson ID are required
 * - Completed at timestamp is required
 * - XP earned must be non-negative
 * - Accuracy must be between 0-100%
 * - Hearts remaining must be between 0-5
 * - Time spent cannot be negative
 */
export class LessonCompletion {
  private constructor(
    private readonly id: LessonCompletionId | null,
    private readonly userId: UserId,
    private readonly lessonId: LessonId,
    private readonly completedAt: Date,
    private readonly xpEarned: XP,
    private readonly accuracy: Accuracy,
    private readonly timeSpentSeconds: number,
    private readonly heartsRemaining: Hearts,
    private readonly isPerfect: boolean,
  ) {
    this.validateInvariants();
  }

  /**
   * Create a new lesson completion record
   *
   * @param userId The user who completed the lesson
   * @param lessonId The lesson that was completed
   * @param accuracy The accuracy achieved (0-100%)
   * @param xpEarned The XP awarded for completion
   * @param timeSpentSeconds Time spent on the lesson in seconds
   * @param heartsRemaining Hearts remaining after completion
   * @param isPerfect Whether the lesson was completed perfectly
   * @returns New LessonCompletion entity
   */
  static create(
    userId: UserId,
    lessonId: LessonId,
    accuracy: Accuracy,
    xpEarned: XP,
    timeSpentSeconds: number,
    heartsRemaining: Hearts,
    isPerfect: boolean,
  ): LessonCompletion {
    return new LessonCompletion(
      null, // No ID yet (will be assigned by repository)
      userId,
      lessonId,
      new Date(),
      xpEarned,
      accuracy,
      timeSpentSeconds,
      heartsRemaining,
      isPerfect,
    );
  }

  /**
   * Reconstitute an existing lesson completion from the database
   *
   * @param id The completion record ID
   * @param userId The user who completed the lesson
   * @param lessonId The lesson that was completed
   * @param completedAt When the lesson was completed
   * @param xpEarned The XP awarded for completion
   * @param accuracy The accuracy achieved
   * @param timeSpentSeconds Time spent on the lesson
   * @param heartsRemaining Hearts remaining after completion
   * @param isPerfect Whether the lesson was completed perfectly
   * @returns Reconstituted LessonCompletion entity
   */
  static reconstitute(
    id: LessonCompletionId,
    userId: UserId,
    lessonId: LessonId,
    completedAt: Date,
    xpEarned: XP,
    accuracy: Accuracy,
    timeSpentSeconds: number,
    heartsRemaining: Hearts,
    isPerfect: boolean,
  ): LessonCompletion {
    return new LessonCompletion(
      id,
      userId,
      lessonId,
      completedAt,
      xpEarned,
      accuracy,
      timeSpentSeconds,
      heartsRemaining,
      isPerfect,
    );
  }

  /**
   * Check if this is a new entity (not yet persisted)
   */
  isNew(): boolean {
    return this.id === null;
  }

  /**
   * Get the completion record ID
   */
  getId(): LessonCompletionId | null {
    return this.id;
  }

  /**
   * Get the user ID
   */
  getUserId(): UserId {
    return this.userId;
  }

  /**
   * Get the lesson ID
   */
  getLessonId(): LessonId {
    return this.lessonId;
  }

  /**
   * Get when the lesson was completed
   */
  getCompletedAt(): Date {
    return new Date(this.completedAt);
  }

  /**
   * Get the XP earned
   */
  getXPEarned(): XP {
    return this.xpEarned;
  }

  /**
   * Get the accuracy achieved
   */
  getAccuracy(): Accuracy {
    return this.accuracy;
  }

  /**
   * Get time spent in seconds
   */
  getTimeSpentSeconds(): number {
    return this.timeSpentSeconds;
  }

  /**
   * Get hearts remaining
   */
  getHeartsRemaining(): Hearts {
    return this.heartsRemaining;
  }

  /**
   * Check if this was a perfect completion
   */
  getIsPerfect(): boolean {
    return this.isPerfect;
  }

  /**
   * Get formatted time spent (MM:SS)
   */
  getFormattedTimeSpent(): string {
    const minutes = Math.floor(this.timeSpentSeconds / 60);
    const seconds = this.timeSpentSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  /**
   * Check if this completion qualifies as a high score
   * (90% or higher accuracy)
   */
  isHighScore(): boolean {
    return this.accuracy.isAbove(90);
  }

  /**
   * Validate entity invariants
   */
  private validateInvariants(): void {
    if (this.timeSpentSeconds < 0) {
      throw new DomainError(
        "Time spent cannot be negative",
        "INVALID_TIME_SPENT",
      );
    }

    // Accuracy validation is handled by the Accuracy value object
    // XP validation is handled by the XP value object
    // Hearts validation is handled by the Hearts value object
  }

  /**
   * Convert to plain object for serialization
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      lessonId: this.lessonId,
      completedAt: this.completedAt.toISOString(),
      xpEarned: this.xpEarned.getAmount(),
      accuracy: this.accuracy.getPercent(),
      timeSpentSeconds: this.timeSpentSeconds,
      timeSpentFormatted: this.getFormattedTimeSpent(),
      heartsRemaining: this.heartsRemaining.remaining(),
      isPerfect: this.isPerfect,
      isHighScore: this.isHighScore(),
    };
  }
}
