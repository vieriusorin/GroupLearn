import type { IQueryHandler } from "@/commands/types";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { FlashcardId } from "@/domains/shared/types/branded-types";
import type { Flashcard } from "@/infrastructure/database/schema";
import type { GetFlashcardByIdQuery } from "@/queries/content/GetFlashcardById.query";

export class GetFlashcardByIdHandler
  implements IQueryHandler<GetFlashcardByIdQuery, Flashcard | undefined>
{
  constructor(private readonly flashcardRepository: IFlashcardRepository) {}

  async execute(query: GetFlashcardByIdQuery): Promise<Flashcard | undefined> {
    const flashcard = await this.flashcardRepository.findById(
      FlashcardId(query.id),
    );
    if (!flashcard) {
      return undefined;
    }

    return {
      id: flashcard.getId() as number,
      categoryId: flashcard.getCategoryId() as number,
      question: flashcard.getQuestion(),
      answer: flashcard.getAnswer(),
      difficulty: flashcard.getDifficulty() as Flashcard["difficulty"],
      createdAt: flashcard.getCreatedAt(),
      createdBy: null,
      computedDifficulty: null,
    } as Flashcard;
  }
}
