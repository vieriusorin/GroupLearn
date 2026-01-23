import type { DueCard, GetDueCardsResult } from "@/application/dtos/review.dto";
import type { IQueryHandler } from "@/commands/types";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import type { IReviewHistoryRepository } from "@/domains/review/repositories/IReviewHistoryRepository";
import { UserId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import type { GetDueCardsQuery } from "@/queries/review/GetDueCards.query";

export class GetDueCardsHandler
  implements IQueryHandler<GetDueCardsQuery, GetDueCardsResult>
{
  constructor(
    private readonly reviewHistoryRepository: IReviewHistoryRepository,
    private readonly flashcardRepository: IFlashcardRepository,
  ) {}

  async execute(query: GetDueCardsQuery): Promise<GetDueCardsResult> {
    const userId = UserId(query.userId);

    const dueFlashcardIds =
      await this.reviewHistoryRepository.findDueFlashcards(userId, query.limit);

    const totalDue =
      await this.reviewHistoryRepository.countDueFlashcards(userId);

    const cards: DueCard[] = [];

    for (const flashcardId of dueFlashcardIds) {
      const flashcard = await this.flashcardRepository.findById(flashcardId);
      if (!flashcard) continue;

      const lastReview = await this.reviewHistoryRepository.findLastReview(
        userId,
        flashcardId,
      );

      const dueCard: DueCard = {
        id: flashcardId as number,
        question: flashcard.getQuestion(),
        answer: flashcard.getAnswer(),
        difficulty: flashcard.getDifficulty() as DifficultyLevelType,
        lastReviewDate: lastReview ? lastReview.reviewDate.toISOString() : null,
        nextReviewDate: lastReview
          ? lastReview.nextReviewDate.toISOString()
          : null,
        intervalDays: lastReview ? lastReview.intervalDays : 1,
      };

      cards.push(dueCard);
    }

    return {
      cards,
      totalDue,
    };
  }
}
