import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { FlashcardId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for deleting a flashcard
 */
export interface DeleteFlashcardRequest {
  userId: string;
  flashcardId: number;
}

/**
 * Response DTO for flashcard deletion
 */
export interface DeleteFlashcardResponse {
  success: boolean;
  message: string;
}

/**
 * DeleteFlashcardUseCase
 *
 * Application service that handles deleting a flashcard.
 *
 * Flow:
 * 1. Validate flashcard exists
 * 2. Delete flashcard from repository
 * 3. Return success
 *
 * Business Rules:
 * - Flashcard must exist
 * - Review history will be cascade deleted by database
 */
export class DeleteFlashcardUseCase {
  constructor(private readonly flashcardRepository: IFlashcardRepository) {}

  async execute(
    request: DeleteFlashcardRequest,
  ): Promise<DeleteFlashcardResponse> {
    const flashcardId = FlashcardId(request.flashcardId);

    // Check if flashcard exists
    const exists = await this.flashcardRepository.exists(flashcardId);
    if (!exists) {
      throw new DomainError("Flashcard not found", "FLASHCARD_NOT_FOUND");
    }

    // Delete flashcard
    await this.flashcardRepository.delete(flashcardId);

    // Return success
    return {
      success: true,
      message: "Flashcard deleted successfully",
    };
  }
}
