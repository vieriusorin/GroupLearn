import { Hearts } from "@/domains/gamification/value-objects/Hearts";
import { DomainError } from "@/domains/shared/errors";
import type {
  FlashcardId,
  LessonId,
} from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import {
  CardAdvancedEvent,
  HeartLostEvent,
  LessonCompletedEvent,
  type LessonEvent,
  LessonFailedEvent,
} from "../events/LessonEvents";
import { Accuracy } from "../value-objects/Accuracy";
import { Answer } from "../value-objects/Answer";
import { Progress } from "../value-objects/Progress";

/**
 * Review mode for lesson
 */
export type ReviewMode = "flashcard" | "quiz" | "recall";

/**
 * Flashcard data needed for lesson session
 */
export interface SessionFlashcard {
  id: FlashcardId;
  question: string;
  answer: string;
  difficulty: DifficultyLevelType;
}

/**
 * LessonSession Aggregate Root
 *
 * Represents an active lesson session where a user is reviewing flashcards.
 * Manages all business logic for lesson progression, hearts, and completion.
 *
 * Invariants:
 * - Cannot advance past the last card
 * - Hearts cannot go negative
 * - Must have at least one flashcard
 * - Answers are immutable once submitted
 */
export class LessonSession {
  private answers: Answer[] = [];
  private currentIndex: number = 0;
  private readonly startedAt: Date;
  private events: LessonEvent[] = [];

  private constructor(
    public readonly lessonId: LessonId,
    private readonly flashcards: SessionFlashcard[],
    private hearts: Hearts,
    private readonly reviewMode: ReviewMode,
  ) {
    this.startedAt = new Date();
    this.validateInvariants();
  }

  /**
   * Start a new lesson session
   *
   * @param lessonId ID of the lesson
   * @param flashcards Flashcards for the lesson
   * @param availableHearts Number of hearts available
   * @param reviewMode Mode of review
   * @returns New lesson session
   * @throws DomainError if validation fails
   */
  static start(
    lessonId: LessonId,
    flashcards: SessionFlashcard[],
    availableHearts: number,
    reviewMode: ReviewMode = "flashcard",
  ): LessonSession {
    if (flashcards.length === 0) {
      throw new DomainError(
        "Cannot start lesson with no flashcards",
        "LESSON_NO_FLASHCARDS",
      );
    }

    return new LessonSession(
      lessonId,
      flashcards,
      Hearts.create(availableHearts),
      reviewMode,
    );
  }

  /**
   * Submit an answer to the current flashcard
   *
   * @param isCorrect Whether the answer was correct
   * @param timeSpentSeconds Optional time spent on this card
   * @returns Lesson event indicating what happened
   * @throws DomainError if session is already complete or failed
   */
  submitAnswer(isCorrect: boolean, timeSpentSeconds?: number): LessonEvent {
    if (this.isComplete()) {
      throw new DomainError(
        "Cannot submit answer - lesson already complete",
        "LESSON_ALREADY_COMPLETE",
      );
    }

    const currentFlashcard = this.getCurrentFlashcard();
    const answer = Answer.create(
      currentFlashcard.id,
      isCorrect,
      new Date(),
      timeSpentSeconds,
    );

    this.answers.push(answer);

    // Handle incorrect answer
    if (!isCorrect) {
      this.hearts = this.hearts.deduct();

      const heartLostEvent = HeartLostEvent.create(
        this.lessonId,
        this.hearts.remaining(),
      );
      this.events.push(heartLostEvent);

      // Check if hearts depleted (lesson failed)
      if (this.hearts.isEmpty()) {
        const failedEvent = LessonFailedEvent.create(
          this.lessonId,
          this.calculateAccuracy(),
          this.answers.length,
        );
        this.events.push(failedEvent);
        return failedEvent;
      }
    }

    // Check if lesson is complete
    if (this.isLastFlashcard()) {
      const completedEvent = LessonCompletedEvent.create(
        this.lessonId,
        this.calculateAccuracy(),
        this.hearts.remaining(),
        this.answers.length,
      );
      this.events.push(completedEvent);
      return completedEvent;
    }

    // Advance to next card
    this.currentIndex++;
    const advancedEvent = CardAdvancedEvent.create(
      this.lessonId,
      this.currentIndex,
      this.flashcards.length,
    );
    this.events.push(advancedEvent);

    return advancedEvent;
  }

  /**
   * Get the current flashcard
   */
  getCurrentFlashcard(): SessionFlashcard {
    return this.flashcards[this.currentIndex];
  }

  /**
   * Get the current progress through the lesson
   */
  getProgress(): Progress {
    return Progress.fromRatio(this.currentIndex + 1, this.flashcards.length);
  }

  /**
   * Get the current accuracy
   */
  getAccuracy(): Accuracy {
    return this.calculateAccuracy();
  }

  /**
   * Get current hearts remaining
   */
  getHearts(): Hearts {
    return this.hearts;
  }

  /**
   * Get all answers submitted so far
   */
  getAnswers(): ReadonlyArray<Answer> {
    return [...this.answers];
  }

  /**
   * Get the review mode
   */
  getReviewMode(): ReviewMode {
    return this.reviewMode;
  }

  /**
   * Get when the session was started
   */
  getStartedAt(): Date {
    return new Date(this.startedAt);
  }

  /**
   * Calculate time spent on lesson so far
   */
  getTimeSpentSeconds(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.startedAt.getTime()) / 1000);
  }

  /**
   * Check if the lesson is complete
   */
  isComplete(): boolean {
    return (
      this.isLastFlashcard() && this.answers.length === this.flashcards.length
    );
  }

  /**
   * Check if the lesson has failed (ran out of hearts)
   */
  isFailed(): boolean {
    return this.hearts.isEmpty() && !this.isComplete();
  }

  /**
   * Check if the lesson was perfect (all correct answers)
   */
  isPerfect(): boolean {
    if (this.answers.length === 0) return false;
    return this.answers.every((answer) => answer.isCorrect());
  }

  /**
   * Get count of correct answers
   */
  getCorrectCount(): number {
    return this.answers.filter((answer) => answer.isCorrect()).length;
  }

  /**
   * Get count of incorrect answers
   */
  getIncorrectCount(): number {
    return this.answers.filter((answer) => answer.isIncorrect()).length;
  }

  /**
   * Get all domain events that occurred during this session
   */
  getEvents(): ReadonlyArray<LessonEvent> {
    return [...this.events];
  }

  /**
   * Clear events (after they've been published)
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Check if this is the last flashcard
   */
  private isLastFlashcard(): boolean {
    return this.currentIndex >= this.flashcards.length - 1;
  }

  /**
   * Calculate accuracy based on answers so far
   */
  private calculateAccuracy(): Accuracy {
    if (this.answers.length === 0) {
      return Accuracy.zero();
    }

    const correctCount = this.getCorrectCount();
    return Accuracy.fromRatio(correctCount, this.answers.length);
  }

  /**
   * Validate aggregate invariants
   */
  private validateInvariants(): void {
    if (this.flashcards.length === 0) {
      throw new DomainError(
        "Lesson session must have at least one flashcard",
        "LESSON_NO_FLASHCARDS",
      );
    }

    if (this.currentIndex < 0 || this.currentIndex >= this.flashcards.length) {
      throw new DomainError(
        "Current index out of bounds",
        "LESSON_INVALID_INDEX",
      );
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toObject() {
    return {
      lessonId: this.lessonId,
      reviewMode: this.reviewMode,
      currentIndex: this.currentIndex,
      totalCards: this.flashcards.length,
      hearts: this.hearts.remaining(),
      answers: this.answers.map((a) => a.toObject()),
      accuracy: this.getAccuracy().getPercent(),
      progress: this.getProgress().getPercentage(),
      timeSpentSeconds: this.getTimeSpentSeconds(),
      isComplete: this.isComplete(),
      isFailed: this.isFailed(),
      isPerfect: this.isPerfect(),
      startedAt: this.startedAt.toISOString(),
    };
  }
}
