import type { LessonId } from "@/domains/shared/types/branded-types";
import type { Accuracy } from "../value-objects/Accuracy";

/**
 * Base class for lesson events
 */
export abstract class LessonEvent {
  constructor(
    public readonly occurredAt: Date,
    public readonly lessonId: LessonId,
  ) {}
}

/**
 * Event fired when a lesson is started
 */
export class LessonStartedEvent extends LessonEvent {
  private constructor(
    lessonId: LessonId,
    public readonly flashcardCount: number,
    occurredAt: Date,
  ) {
    super(occurredAt, lessonId);
  }

  static create(
    lessonId: LessonId,
    flashcardCount: number,
  ): LessonStartedEvent {
    return new LessonStartedEvent(lessonId, flashcardCount, new Date());
  }
}

/**
 * Event fired when advancing to the next card in a lesson
 */
export class CardAdvancedEvent extends LessonEvent {
  private constructor(
    lessonId: LessonId,
    public readonly currentIndex: number,
    public readonly totalCards: number,
    occurredAt: Date,
  ) {
    super(occurredAt, lessonId);
  }

  static create(
    lessonId: LessonId,
    currentIndex: number,
    totalCards: number,
  ): CardAdvancedEvent {
    return new CardAdvancedEvent(
      lessonId,
      currentIndex,
      totalCards,
      new Date(),
    );
  }
}

/**
 * Event fired when a lesson is completed successfully
 */
export class LessonCompletedEvent extends LessonEvent {
  private constructor(
    lessonId: LessonId,
    public readonly accuracy: Accuracy,
    public readonly heartsRemaining: number,
    public readonly cardsReviewed: number,
    occurredAt: Date,
  ) {
    super(occurredAt, lessonId);
  }

  static create(
    lessonId: LessonId,
    accuracy: Accuracy,
    heartsRemaining: number,
    cardsReviewed: number,
  ): LessonCompletedEvent {
    return new LessonCompletedEvent(
      lessonId,
      accuracy,
      heartsRemaining,
      cardsReviewed,
      new Date(),
    );
  }
}

/**
 * Event fired when a lesson is failed (ran out of hearts)
 */
export class LessonFailedEvent extends LessonEvent {
  private constructor(
    lessonId: LessonId,
    public readonly accuracy: Accuracy,
    public readonly cardsReviewed: number,
    occurredAt: Date,
  ) {
    super(occurredAt, lessonId);
  }

  static create(
    lessonId: LessonId,
    accuracy: Accuracy,
    cardsReviewed: number,
  ): LessonFailedEvent {
    return new LessonFailedEvent(lessonId, accuracy, cardsReviewed, new Date());
  }
}

/**
 * Event fired when a heart is lost during a lesson
 */
export class HeartLostEvent extends LessonEvent {
  private constructor(
    lessonId: LessonId,
    public readonly heartsRemaining: number,
    occurredAt: Date,
  ) {
    super(occurredAt, lessonId);
  }

  static create(lessonId: LessonId, heartsRemaining: number): HeartLostEvent {
    return new HeartLostEvent(lessonId, heartsRemaining, new Date());
  }
}
