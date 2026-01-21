"use server";

import { revalidateTag } from "next/cache";
import type { UpdateFlashcardResponse } from "@/application/use-cases/content/UpdateFlashcardUseCase";
import { UpdateFlashcardUseCase } from "@/application/use-cases/content/UpdateFlashcardUseCase";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateFlashcard(
  flashcardId: number,
  question?: string,
  answer?: string,
  difficulty?: DifficultyLevelType,
): Promise<ActionResult<UpdateFlashcardResponse["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!flashcardId || flashcardId <= 0) {
      return {
        success: false,
        error: "Invalid flashcard ID",
        code: "VALIDATION_ERROR",
      };
    }

    if (
      question === undefined &&
      answer === undefined &&
      difficulty === undefined
    ) {
      return {
        success: false,
        error:
          "At least one field (question, answer, or difficulty) must be provided",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new UpdateFlashcardUseCase(
      repositories.flashcard,
      repositories.category,
    );

    const result = await useCase.execute({
      userId: user.id,
      flashcardId,
      question,
      answer,
      difficulty,
    });

    // Invalidate dashboard stats cache since flashcard was updated
    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
