import type { GetFlashcardsResult } from "@/application/dtos/content.dto";
import type { IQueryHandler } from "@/commands/types";
import type { Flashcard } from "@/domains/content/entities/Flashcard";
import type { PaginatedResult } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { CategoryId } from "@/domains/shared/types/branded-types";
import type { GetFlashcardsQuery } from "@/queries/content/GetFlashcards.query";

export class GetFlashcardsHandler
  implements IQueryHandler<GetFlashcardsQuery, GetFlashcardsResult>
{
  constructor(private readonly flashcardRepository: IFlashcardRepository) {}

  async execute(query: GetFlashcardsQuery): Promise<GetFlashcardsResult> {
    let result: PaginatedResult<Flashcard>;

    if (query.categoryId) {
      const categoryId = CategoryId(query.categoryId);
      result = await this.flashcardRepository.findByCategoryPaginated(
        categoryId,
        { page: query.page || 1, limit: query.limit || 20 },
      );
    } else {
      result = await this.flashcardRepository.search("", {
        page: query.page || 1,
        limit: query.limit || 20,
      });
    }

    const flashcards = result.items;

    const flashcardsData = flashcards.map((flashcard) => ({
      id: flashcard.getId() as number,
      categoryId: flashcard.getCategoryId() as number,
      question: flashcard.getQuestion(),
      answer: flashcard.getAnswer(),
      difficulty: flashcard.getDifficulty(),
      computedDifficulty: flashcard.getComputedDifficulty(),
      createdAt: flashcard.getCreatedAt().toISOString(),
    }));

    const pagination = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };

    return {
      flashcards: flashcardsData,
      pagination,
    };
  }
}
