import type { CreateFlashcardResult } from "@/application/dtos/content.dto";
import type { CreateFlashcardCommand } from "@/commands/content/CreateFlashcard.command";
import type { ICommandHandler } from "@/commands/types";
import { Flashcard } from "@/domains/content/entities/Flashcard";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";

export class CreateFlashcardHandler
  implements ICommandHandler<CreateFlashcardCommand, CreateFlashcardResult>
{
  constructor(
    private readonly flashcardRepository: IFlashcardRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    command: CreateFlashcardCommand,
  ): Promise<CreateFlashcardResult> {
    const categoryId = CategoryId(command.categoryId);

    if (!command.question || !command.question.trim()) {
      throw new DomainError("Question is required", "VALIDATION_ERROR");
    }

    if (!command.answer || !command.answer.trim()) {
      throw new DomainError("Answer is required", "VALIDATION_ERROR");
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const flashcard = Flashcard.create(
      categoryId,
      command.question.trim(),
      command.answer.trim(),
      command.difficulty || "medium",
    );

    const savedFlashcard = await this.flashcardRepository.save(flashcard);

    return {
      success: true,
      data: {
        id: savedFlashcard.getId() as number,
        categoryId: savedFlashcard.getCategoryId() as number,
        question: savedFlashcard.getQuestion(),
        answer: savedFlashcard.getAnswer(),
        difficulty: savedFlashcard.getDifficulty(),
        createdAt: savedFlashcard.getCreatedAt().toISOString(),
      },
    };
  }
}
