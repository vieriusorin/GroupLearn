import { Flashcard } from "@/domains/content/entities/Flashcard";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema/enums";

export interface BulkCreateFlashcardsRequest {
  userId: string;
  categoryId: number;
  flashcards: Array<{
    question: string;
    answer: string;
    difficulty?: DifficultyLevelType;
  }>;
}

export interface BulkCreateFlashcardsResponse {
  success: boolean;
  created: number;
  failed: number;
  errors: Array<{
    index: number;
    question: string;
    error: string;
  }>;
  data: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
  }>;
}

export class BulkCreateFlashcardsUseCase {
  constructor(
    private readonly flashcardRepository: IFlashcardRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    request: BulkCreateFlashcardsRequest,
  ): Promise<BulkCreateFlashcardsResponse> {
    const categoryId = CategoryId(request.categoryId);

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const errors: Array<{ index: number; question: string; error: string }> =
      [];
    const validFlashcards: Array<{
      question: string;
      answer: string;
      difficulty: DifficultyLevelType;
    }> = [];

    request.flashcards.forEach((fc, index) => {
      if (!fc.question || !fc.question.trim()) {
        errors.push({
          index,
          question: fc.question || "",
          error: "Question is required",
        });
        return;
      }

      if (!fc.answer || !fc.answer.trim()) {
        errors.push({
          index,
          question: fc.question,
          error: "Answer is required",
        });
        return;
      }

      validFlashcards.push({
        question: fc.question.trim(),
        answer: fc.answer.trim(),
        difficulty: fc.difficulty || "medium",
      });
    });

    const flashcards = validFlashcards.map((fc) =>
      Flashcard.create(categoryId, fc.question, fc.answer, fc.difficulty),
    );

    const results = await this.flashcardRepository.saveMany(flashcards);

    return {
      success: errors.length === 0,
      created: results.length,
      failed: errors.length,
      errors,
      data: results.map((fc) => ({
        id: fc.getId() as number,
        question: fc.getQuestion(),
        answer: fc.getAnswer(),
        difficulty: fc.getDifficulty(),
      })),
    };
  }
}
