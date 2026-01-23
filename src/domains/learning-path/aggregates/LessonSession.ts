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

export type ReviewMode = "flashcard" | "quiz" | "recall";

export interface SessionFlashcard {
  id: FlashcardId;
  question: string;
  answer: string;
  difficulty: DifficultyLevelType;
}

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

    if (!isCorrect) {
      this.hearts = this.hearts.deduct();

      const heartLostEvent = HeartLostEvent.create(
        this.lessonId,
        this.hearts.remaining(),
      );
      this.events.push(heartLostEvent);

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

    this.currentIndex++;
    const advancedEvent = CardAdvancedEvent.create(
      this.lessonId,
      this.currentIndex,
      this.flashcards.length,
    );
    this.events.push(advancedEvent);

    return advancedEvent;
  }

  getCurrentFlashcard(): SessionFlashcard {
    return this.flashcards[this.currentIndex];
  }

  getProgress(): Progress {
    return Progress.fromRatio(this.currentIndex + 1, this.flashcards.length);
  }

  getAccuracy(): Accuracy {
    return this.calculateAccuracy();
  }

  getHearts(): Hearts {
    return this.hearts;
  }

  getAnswers(): ReadonlyArray<Answer> {
    return [...this.answers];
  }

  getReviewMode(): ReviewMode {
    return this.reviewMode;
  }

  getStartedAt(): Date {
    return new Date(this.startedAt);
  }

  getTimeSpentSeconds(): number {
    const now = new Date();
    return Math.floor((now.getTime() - this.startedAt.getTime()) / 1000);
  }

  isComplete(): boolean {
    return (
      this.isLastFlashcard() && this.answers.length === this.flashcards.length
    );
  }

  isFailed(): boolean {
    return this.hearts.isEmpty() && !this.isComplete();
  }

  isPerfect(): boolean {
    if (this.answers.length === 0) return false;
    return this.answers.every((answer) => answer.isCorrect());
  }

  getCorrectCount(): number {
    return this.answers.filter((answer) => answer.isCorrect()).length;
  }

  getIncorrectCount(): number {
    return this.answers.filter((answer) => answer.isIncorrect()).length;
  }

  getEvents(): ReadonlyArray<LessonEvent> {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  private isLastFlashcard(): boolean {
    return this.currentIndex >= this.flashcards.length - 1;
  }

  private calculateAccuracy(): Accuracy {
    if (this.answers.length === 0) {
      return Accuracy.zero();
    }

    const correctCount = this.getCorrectCount();
    return Accuracy.fromRatio(correctCount, this.answers.length);
  }

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
