import type { UpdateFlashcardResult } from "@/application/dtos/content.dto";
import type { UpdateFlashcardCommand } from "@/commands/content/UpdateFlashcard.command";
import type { ICommandHandler } from "@/commands/types";
import { Flashcard } from "@/domains/content/entities/Flashcard";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { FlashcardId } from "@/domains/shared/types/branded-types";

export class UpdateFlashcardHandler
  implements ICommandHandler<UpdateFlashcardCommand, UpdateFlashcardResult>
{
  constructor(private readonly flashcardRepository: IFlashcardRepository) {}

  async execute(
    command: UpdateFlashcardCommand,
  ): Promise<UpdateFlashcardResult> {
    const flashcardId = FlashcardId(command.flashcardId);

    const flashcard = await this.flashcardRepository.findById(flashcardId);
    if (!flashcard) {
      throw new DomainError("Flashcard not found", "FLASHCARD_NOT_FOUND");
    }

    let updatedFlashcard = flashcard;

    if (command.question !== undefined) {
      if (!command.question.trim()) {
        throw new DomainError("Question cannot be empty", "INVALID_QUESTION");
      }
      updatedFlashcard = Flashcard.reconstitute(
        flashcard.getId(),
        flashcard.getCategoryId(),
        command.question.trim(),
        flashcard.getAnswer(),
        flashcard.getDifficulty(),
        flashcard.getComputedDifficulty(),
        flashcard.getCreatedAt(),
      );
    }

    if (command.answer !== undefined) {
      if (!command.answer.trim()) {
        throw new DomainError("Answer cannot be empty", "INVALID_ANSWER");
      }
      updatedFlashcard = Flashcard.reconstitute(
        updatedFlashcard.getId(),
        updatedFlashcard.getCategoryId(),
        updatedFlashcard.getQuestion(),
        command.answer.trim(),
        updatedFlashcard.getDifficulty(),
        updatedFlashcard.getComputedDifficulty(),
        updatedFlashcard.getCreatedAt(),
      );
    }

    if (command.difficulty !== undefined) {
      updatedFlashcard = Flashcard.reconstitute(
        updatedFlashcard.getId(),
        updatedFlashcard.getCategoryId(),
        updatedFlashcard.getQuestion(),
        updatedFlashcard.getAnswer(),
        command.difficulty,
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
