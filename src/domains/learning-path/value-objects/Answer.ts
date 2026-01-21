import type { FlashcardId } from "@/domains/shared/types/branded-types";

/**
 * Answer value object
 *
 * Represents a single answer to a flashcard during a lesson or review session.
 * Immutable record of what was answered and when.
 */
export class Answer {
  private constructor(
    public readonly flashcardId: FlashcardId,
    private readonly correct: boolean,
    public readonly answeredAt: Date,
    public readonly timeSpentSeconds?: number,
  ) {}

  /**
   * Create an answer
   */
  static create(
    flashcardId: FlashcardId,
    isCorrect: boolean,
    answeredAt: Date,
    timeSpentSeconds?: number,
  ): Answer {
    return new Answer(flashcardId, isCorrect, answeredAt, timeSpentSeconds);
  }

  /**
   * Check if the answer was correct
   */
  isCorrect(): boolean {
    return this.correct;
  }

  /**
   * Check if the answer was incorrect
   */
  isIncorrect(): boolean {
    return !this.correct;
  }

  /**
   * Get time spent on this answer
   */
  getTimeSpent(): number | undefined {
    return this.timeSpentSeconds;
  }

  /**
   * Check if this answer was fast (answered in less than N seconds)
   */
  isFast(thresholdSeconds: number): boolean {
    if (this.timeSpentSeconds === undefined) {
      return false;
    }
    return this.timeSpentSeconds < thresholdSeconds;
  }

  /**
   * Check if this answer was slow (took more than N seconds)
   */
  isSlow(thresholdSeconds: number): boolean {
    if (this.timeSpentSeconds === undefined) {
      return false;
    }
    return this.timeSpentSeconds > thresholdSeconds;
  }

  /**
   * Convert to plain object for serialization
   */
  toObject() {
    return {
      flashcardId: this.flashcardId,
      correct: this.correct,
      answeredAt: this.answeredAt.toISOString(),
      timeSpentSeconds: this.timeSpentSeconds,
    };
  }
}
