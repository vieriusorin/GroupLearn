"use server";

import { revalidateTag } from "next/cache";
import type { DeleteFlashcardResponse } from "@/application/use-cases/content/DeleteFlashcardUseCase";
import { DeleteFlashcardUseCase } from "@/application/use-cases/content/DeleteFlashcardUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteFlashcard(
  flashcardId: number,
): Promise<ActionResult<DeleteFlashcardResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!flashcardId || flashcardId <= 0) {
      return {
        success: false,
        error: "Invalid flashcard ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new DeleteFlashcardUseCase(repositories.flashcard);

    const result = await useCase.execute({
      userId: user.id,
      flashcardId,
    });

    // Invalidate dashboard stats cache since flashcard count changed
    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
