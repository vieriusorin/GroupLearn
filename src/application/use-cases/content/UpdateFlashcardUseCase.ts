import { Flashcard } from "@/domains/content/entities/Flashcard";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { FlashcardId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema/enums";

export interface UpdateFlashcardRequest {
  userId: string;
  flashcardId: number;
  question?: string;
  answer?: string;
  difficulty?: DifficultyLevelType;
}

export interface UpdateFlashcardResponse {
  success: boolean;
  data: {
    id: number;
    categoryId: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    computedDifficulty: DifficultyLevelType | null;
    createdAt: string;
  };
}

export class UpdateFlashcardUseCase {
  constructor(
    private readonly flashcardRepository: IFlashcardRepository,
    readonly _categoryRepository: ICategoryRepository,
  ) {}

  async execute(
    request: UpdateFlashcardRequest,
  ): Promise<UpdateFlashcardResponse> {
    const flashcardId = FlashcardId(request.flashcardId);

    const flashcard = await this.flashcardRepository.findById(flashcardId);
    if (!flashcard) {
      throw new DomainError("Flashcard not found", "FLASHCARD_NOT_FOUND");
    }

    let updatedFlashcard = flashcard;

    if (request.question !== undefined) {
      if (!request.question.trim()) {
        throw new DomainError("Question cannot be empty", "INVALID_QUESTION");
      }
      updatedFlashcard = Flashcard.reconstitute(
        flashcard.getId(),
        flashcard.getCategoryId(),
        request.question.trim(),
        flashcard.getAnswer(),
        flashcard.getDifficulty(),
        flashcard.getComputedDifficulty(),
        flashcard.getCreatedAt(),
      );
    }

    if (request.answer !== undefined) {
      if (!request.answer.trim()) {
        throw new DomainError("Answer cannot be empty", "INVALID_ANSWER");
      }
      updatedFlashcard = Flashcard.reconstitute(
        updatedFlashcard.getId(),
        updatedFlashcard.getCategoryId(),
        updatedFlashcard.getQuestion(),
        request.answer.trim(),
        updatedFlashcard.getDifficulty(),
        updatedFlashcard.getComputedDifficulty(),
        updatedFlashcard.getCreatedAt(),
      );
    }

    if (request.difficulty !== undefined) {
      updatedFlashcard = Flashcard.reconstitute(
        updatedFlashcard.getId(),
        updatedFlashcard.getCategoryId(),
        updatedFlashcard.getQuestion(),
        updatedFlashcard.getAnswer(),
        request.difficulty,
        updatedFlashcard.getComputedDifficulty(),
        updatedFlashcard.getCreatedAt(),
      );
    }

    const saved = await this.flashcardRepository.save(updatedFlashcard);

    return {
      success: true,
      data: {
        id: saved.getId() as number,
        categoryId: saved.getCategoryId() as number,
        question: saved.getQuestion(),
        answer: saved.getAnswer(),
        difficulty: saved.getDifficulty(),
        computedDifficulty: saved.getComputedDifficulty(),
        createdAt: saved.getCreatedAt().toISOString(),
      },
    };
  }
}
