import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import type { IReviewHistoryRepository } from "@/domains/review/repositories/IReviewHistoryRepository";
import { UserId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";

export interface GetDueCardsRequest {
  userId: string;
  limit?: number;
}

export interface GetDueCardsResponse {
  cards: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    lastReviewDate: string | null;
    nextReviewDate: string | null;
    intervalDays: number;
  }>;
  totalDue: number;
}

export class GetDueCardsUseCase {
  constructor(
    private readonly reviewHistoryRepository: IReviewHistoryRepository,
    private readonly flashcardRepository: IFlashcardRepository,
  ) {}

  async execute(request: GetDueCardsRequest): Promise<GetDueCardsResponse> {
    const userId = UserId(request.userId);

    const dueFlashcardIds =
      await this.reviewHistoryRepository.findDueFlashcards(
        userId,
        request.limit,
      );

    const totalDue =
      await this.reviewHistoryRepository.countDueFlashcards(userId);

    const cards = [];

    for (const flashcardId of dueFlashcardIds) {
      const flashcard = await this.flashcardRepository.findById(flashcardId);
      if (!flashcard) continue;

      const lastReview = await this.reviewHistoryRepository.findLastReview(
        userId,
        flashcardId,
      );

      cards.push({
        id: flashcardId as number,
        question: flashcard.getQuestion(),
        answer: flashcard.getAnswer(),
        difficulty: flashcard.getDifficulty() as DifficultyLevelType,
        lastReviewDate: lastReview ? lastReview.reviewDate.toISOString() : null,
        nextReviewDate: lastReview
          ? lastReview.nextReviewDate.toISOString()
          : null,
        intervalDays: lastReview ? lastReview.intervalDays : 1,
      });
    }

    return {
      cards,
      totalDue,
    };
  }
}
