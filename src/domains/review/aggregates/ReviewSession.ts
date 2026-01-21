import { DomainError } from "@/domains/shared/errors";
import type { FlashcardId, UserId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import {
  CardMarkedAsStrugglingEvent,
  CardMasteredEvent,
  CardStruggledEvent,
  type ReviewEvent,
  ReviewSessionCompletedEvent,
  ReviewSessionStartedEvent,
} from "../events/ReviewEvents";
import {
  type ReviewHistoryRecord,
  SpacedRepetitionService,
} from "../services/SpacedRepetitionService";
import type { ReviewInterval } from "../value-objects/ReviewInterval";

export type ReviewMode = "flashcard" | "quiz" | "recall";

export interface ReviewFlashcard {
  id: FlashcardId;
  question: string;
  answer: string;
  difficulty: DifficultyLevelType;
  lastReviewDate: Date | null;
  intervalDays: number;
  reviewHistory: ReviewHistoryRecord[];
}

export class ReviewResult {
  constructor(
    public readonly flashcardId: FlashcardId,
    public readonly isCorrect: boolean,
    public readonly reviewMode: ReviewMode,
    public readonly reviewedAt: Date,
  ) {}

  static create(
    flashcardId: FlashcardId,
    isCorrect: boolean,
    reviewMode: ReviewMode,
  ): ReviewResult {
    return new ReviewResult(flashcardId, isCorrect, reviewMode, new Date());
  }
}

export class ReviewSession {
  private reviewedCards: Map<FlashcardId, ReviewResult> = new Map();
  private currentIndex: number = 0;
  private events: Array<
    ReviewEvent | ReviewSessionStartedEvent | ReviewSessionCompletedEvent
  > = [];
  private readonly spacedRepetitionService: SpacedRepetitionService;

  private constructor(
    public readonly userId: UserId,
    private readonly dueCards: ReviewFlashcard[],
    private readonly mode: ReviewMode,
    public readonly startedAt: Date,
  ) {
    this.spacedRepetitionService = new SpacedRepetitionService();
    this.validateInvariants();

    this.events.push(ReviewSessionStartedEvent.create(dueCards.length));
  }

  static start(
    userId: UserId,
    dueCards: ReviewFlashcard[],
    mode: ReviewMode = "flashcard",
  ): ReviewSession {
    if (dueCards.length === 0) {
      throw new DomainError("No cards due for review", "REVIEW_NO_DUE_CARDS");
    }

    return new ReviewSession(userId, dueCards, mode, new Date());
  }

  submitReview(isCorrect: boolean): ReviewEvent {
    if (this.isComplete()) {
      throw new DomainError(
        "Cannot submit review - session already complete",
        "REVIEW_SESSION_COMPLETE",
      );
    }

    const currentCard = this.getCurrentCard();
    const result = ReviewResult.create(currentCard.id, isCorrect, this.mode);

    this.reviewedCards.set(currentCard.id, result);

    let event: ReviewEvent;

    if (isCorrect) {
      const interval = this.calculateNextInterval(currentCard, true);
      event = CardMasteredEvent.create(currentCard.id, interval);
    } else {
      const failureCount = this.getFailureCount(currentCard.id);
      const totalAttempts = currentCard.reviewHistory.length + 1;
      const shouldMark = this.spacedRepetitionService.shouldMarkAsStruggling(
        failureCount,
        totalAttempts,
      );

      event = CardStruggledEvent.create(
        currentCard.id,
        failureCount,
        shouldMark,
      );

      if (shouldMark) {
        const markEvent = CardMarkedAsStrugglingEvent.create(
          currentCard.id,
          failureCount,
        );
        this.events.push(markEvent);
      }
    }

    this.events.push(event);

    if (this.hasMoreCards()) {
      this.currentIndex++;
    } else {
      const completedEvent = ReviewSessionCompletedEvent.create(
        this.reviewedCards.size,
        this.getCorrectCount(),
      );
      this.events.push(completedEvent);
    }

    return event;
  }

  getCurrentCard(): ReviewFlashcard {
    return this.dueCards[this.currentIndex];
  }

  hasMoreCards(): boolean {
    return this.currentIndex < this.dueCards.length - 1;
  }

  getProgress(): { reviewed: number; total: number; percent: number } {
    const reviewed = this.reviewedCards.size;
    const total = this.dueCards.length;
    const percent = total > 0 ? Math.round((reviewed / total) * 100) : 0;

    return { reviewed, total, percent };
  }

  isComplete(): boolean {
    return this.reviewedCards.size === this.dueCards.length;
  }

  getCorrectCount(): number {
    return Array.from(this.reviewedCards.values()).filter((r) => r.isCorrect)
      .length;
  }

  getIncorrectCount(): number {
    return Array.from(this.reviewedCards.values()).filter((r) => !r.isCorrect)
      .length;
  }

  getAccuracyPercent(): number {
    const total = this.reviewedCards.size;
    if (total === 0) return 0;

    const correct = this.getCorrectCount();
    return Math.round((correct / total) * 100);
  }

  getReviewedCards(): Map<FlashcardId, ReviewResult> {
    return new Map(this.reviewedCards);
  }

  getEvents(): ReadonlyArray<
    ReviewEvent | ReviewSessionStartedEvent | ReviewSessionCompletedEvent
  > {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  private calculateNextInterval(
    card: ReviewFlashcard,
    wasCorrect: boolean,
  ): ReviewInterval {
    return this.spacedRepetitionService.calculateNextInterval(
      card.reviewHistory,
      wasCorrect,
    );
  }

  private getFailureCount(flashcardId: FlashcardId): number {
    const currentCard = this.dueCards.find((c) => c.id === flashcardId);
    if (!currentCard) return 0;

    let count = 0;
    for (let i = currentCard.reviewHistory.length - 1; i >= 0; i--) {
      if (!currentCard.reviewHistory[i].isCorrect) {
        count++;
      } else {
        break;
      }
    }

    const currentResult = this.reviewedCards.get(flashcardId);
    if (currentResult && !currentResult.isCorrect) {
      count++;
    }

    return count;
  }

  private validateInvariants(): void {
    if (this.dueCards.length === 0) {
      throw new DomainError(
        "Review session must have at least one card",
        "REVIEW_NO_CARDS",
      );
    }

    if (this.currentIndex < 0 || this.currentIndex >= this.dueCards.length) {
      throw new DomainError(
        "Current index out of bounds",
        "REVIEW_INVALID_INDEX",
      );
    }
  }

  toObject() {
    return {
      userId: this.userId,
      mode: this.mode,
      progress: this.getProgress(),
      accuracy: this.getAccuracyPercent(),
      correctCount: this.getCorrectCount(),
      incorrectCount: this.getIncorrectCount(),
      isComplete: this.isComplete(),
      startedAt: this.startedAt.toISOString(),
      currentCard: this.isComplete() ? null : this.getCurrentCard(),
    };
  }
}
