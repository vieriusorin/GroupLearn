import type { DeleteResult } from "@/application/dtos/content.dto";
import type { DeleteFlashcardCommand } from "@/commands/content/DeleteFlashcard.command";
import type { ICommandHandler } from "@/commands/types";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { FlashcardId } from "@/domains/shared/types/branded-types";

export class DeleteFlashcardHandler
  implements ICommandHandler<DeleteFlashcardCommand, DeleteResult>
{
  constructor(private readonly flashcardRepository: IFlashcardRepository) {}

  async execute(command: DeleteFlashcardCommand): Promise<DeleteResult> {
    const flashcardId = FlashcardId(command.flashcardId);

    const exists = await this.flashcardRepository.exists(flashcardId);
    if (!exists) {
      throw new DomainError("Flashcard not found", "FLASHCARD_NOT_FOUND");
    }

    await this.flashcardRepository.delete(flashcardId);

    return {
      success: true,
      message: "Flashcard deleted successfully",
    };
  }
}
