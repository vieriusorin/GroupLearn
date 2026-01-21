import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import {
  type ReviewFlashcard,
  type ReviewMode,
  ReviewSession,
} from "@/domains/review/aggregates/ReviewSession";
import type { IReviewHistoryRepository } from "@/domains/review/repositories/IReviewHistoryRepository";
import { DomainError } from "@/domains/shared/errors";
import { UserId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";

export interface StartReviewSessionRequest {
  userId: string;
  mode?: ReviewMode;
  limit?: number;
}

export interface StartReviewSessionResponse {
  sessionId: string;
  mode: ReviewMode;
  totalCards: number;
  currentCard: {
    id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
  };
  progress: {
    current: number;
    total: number;
    percent: number;
  };
}

export class StartReviewSessionUseCase {
  constructor(
    private readonly reviewHistoryRepository: IReviewHistoryRepository,
    private readonly flashcardRepository: IFlashcardRepository,
  ) {}

  async execute(
    request: StartReviewSessionRequest,
  ): Promise<StartReviewSessionResponse> {
    const userId = UserId(request.userId);
    const mode = request.mode || "flashcard";

    const dueFlashcardIds =
      await this.reviewHistoryRepository.findDueFlashcards(
        userId,
        request.limit,
      );

    if (dueFlashcardIds.length === 0) {
      throw new DomainError("No cards due for review", "NO_DUE_CARDS");
    }

    const reviewFlashcards: ReviewFlashcard[] = [];

    for (const flashcardId of dueFlashcardIds) {
      const flashcard = await this.flashcardRepository.findById(flashcardId);
      if (!flashcard) continue;

      const reviewHistory =
        await this.reviewHistoryRepository.findByUserAndFlashcard(
          userId,
          flashcardId,
        );

      const lastReview = reviewHistory.length > 0 ? reviewHistory[0] : null;

      reviewFlashcards.push({
        id: flashcardId,
        question: flashcard.getQuestion(),
        answer: flashcard.getAnswer(),
        difficulty: flashcard.getDifficulty() as DifficultyLevelType,
        lastReviewDate: lastReview ? lastReview.reviewDate : null,
        intervalDays: lastReview ? lastReview.intervalDays : 1,
        reviewHistory: reviewHistory,
      });
    }

    const session = ReviewSession.start(userId, reviewFlashcards, mode);

    const currentCard = session.getCurrentCard();

    return {
      sessionId: `review-${userId}-${Date.now()}`,
      mode,
      totalCards: reviewFlashcards.length,
      currentCard: {
        id: currentCard.id as number,
        question: currentCard.question,
        answer: currentCard.answer,
        difficulty: currentCard.difficulty,
      },
      progress: {
        current: 1,
        total: reviewFlashcards.length,
        percent: Math.round((1 / reviewFlashcards.length) * 100),
      },
    };
  }
}
