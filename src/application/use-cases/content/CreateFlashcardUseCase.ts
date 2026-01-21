import { Flashcard } from "@/domains/content/entities/Flashcard";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";

export interface CreateFlashcardRequest {
  userId: string;
  categoryId: number;
  question: string;
  answer: string;
  difficulty?: DifficultyLevelType;
}

export interface CreateFlashcardResponse {
  success: boolean;
  data: {
    id: number;
    categoryId: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    createdAt: string;
  };
}

export class CreateFlashcardUseCase {
  constructor(
    private readonly flashcardRepository: IFlashcardRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    request: CreateFlashcardRequest,
  ): Promise<CreateFlashcardResponse> {
    const categoryId = CategoryId(request.categoryId);

    if (!request.question || !request.question.trim()) {
      throw new DomainError("Question is required", "VALIDATION_ERROR");
    }

    if (!request.answer || !request.answer.trim()) {
      throw new DomainError("Answer is required", "VALIDATION_ERROR");
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const flashcard = Flashcard.create(
      categoryId,
      request.question.trim(),
      request.answer.trim(),
      request.difficulty || "medium",
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
