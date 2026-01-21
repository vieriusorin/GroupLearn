import type { FlashcardId } from "@/domains/shared/types/branded-types";
import type { ReviewInterval } from "../value-objects/ReviewInterval";

/**
 * Base class for review events
 */
export abstract class ReviewEvent {
  constructor(
    public readonly occurredAt: Date,
    public readonly flashcardId: FlashcardId,
  ) {}
}

/**
 * Event fired when a review session is started
 */
export class ReviewSessionStartedEvent {
  private constructor(
    public readonly cardCount: number,
    public readonly occurredAt: Date,
  ) {}

  static create(cardCount: number): ReviewSessionStartedEvent {
    return new ReviewSessionStartedEvent(cardCount, new Date());
  }
}

/**
 * Event fired when a card is mastered (correct answer)
 */
export class CardMasteredEvent extends ReviewEvent {
  private constructor(
    flashcardId: FlashcardId,
    public readonly nextReviewInterval: ReviewInterval,
    public readonly nextReviewDate: Date,
    occurredAt: Date,
  ) {
    super(occurredAt, flashcardId);
  }

  static create(
    flashcardId: FlashcardId,
    interval: ReviewInterval,
  ): CardMasteredEvent {
    const nextReviewDate = interval.calculateNextReviewDate();
    return new CardMasteredEvent(
      flashcardId,
      interval,
      nextReviewDate,
      new Date(),
    );
  }
}

/**
 * Event fired when a user struggles with a card (incorrect answer)
 */
export class CardStruggledEvent extends ReviewEvent {
  private constructor(
    flashcardId: FlashcardId,
    public readonly failureCount: number,
    public readonly shouldMarkAsStruggling: boolean,
    occurredAt: Date,
  ) {
    super(occurredAt, flashcardId);
  }

  static create(
    flashcardId: FlashcardId,
    failureCount: number,
    shouldMarkAsStruggling: boolean = false,
  ): CardStruggledEvent {
    return new CardStruggledEvent(
      flashcardId,
      failureCount,
      shouldMarkAsStruggling,
      new Date(),
    );
  }
}

/**
 * Event fired when a review session is completed
 */
export class ReviewSessionCompletedEvent {
  private constructor(
    public readonly totalReviewed: number,
    public readonly correctCount: number,
    public readonly accuracyPercent: number,
    public readonly occurredAt: Date,
  ) {}

  static create(
    totalReviewed: number,
    correctCount: number,
  ): ReviewSessionCompletedEvent {
    const accuracyPercent =
      totalReviewed > 0 ? Math.round((correctCount / totalReviewed) * 100) : 0;
    return new ReviewSessionCompletedEvent(
      totalReviewed,
      correctCount,
      accuracyPercent,
      new Date(),
    );
  }
}

/**
 * Event fired when a card is added to struggling cards
 */
export class CardMarkedAsStrugglingEvent extends ReviewEvent {
  private constructor(
    flashcardId: FlashcardId,
    public readonly totalFailures: number,
    occurredAt: Date,
  ) {
    super(occurredAt, flashcardId);
  }

  static create(
    flashcardId: FlashcardId,
    totalFailures: number,
  ): CardMarkedAsStrugglingEvent {
    return new CardMarkedAsStrugglingEvent(
      flashcardId,
      totalFailures,
      new Date(),
    );
  }
}

/**
 * Event fired when a struggling card is removed (mastered)
 */
export class StrugglingCardRemovedEvent extends ReviewEvent {
  private constructor(
    flashcardId: FlashcardId,
    public readonly reason: "mastered" | "deleted",
    occurredAt: Date,
  ) {
    super(occurredAt, flashcardId);
  }

  static create(
    flashcardId: FlashcardId,
    reason: "mastered" | "deleted",
  ): StrugglingCardRemovedEvent {
    return new StrugglingCardRemovedEvent(flashcardId, reason, new Date());
  }
}
