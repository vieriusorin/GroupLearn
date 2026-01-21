"use server";

import { revalidateTag } from "next/cache";
import type { BulkCreateFlashcardsResponse } from "@/application/use-cases/content/BulkCreateFlashcardsUseCase";
import { BulkCreateFlashcardsUseCase } from "@/application/use-cases/content/BulkCreateFlashcardsUseCase";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function bulkCreateFlashcards(
  categoryId: number,
  flashcards: Array<{
    question: string;
    answer: string;
    difficulty?: DifficultyLevelType;
  }>,
): Promise<ActionResult<BulkCreateFlashcardsResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "Invalid category ID",
        code: "VALIDATION_ERROR",
      };
    }

    if (!flashcards || flashcards.length === 0) {
      return {
        success: false,
        error: "At least one flashcard is required",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new BulkCreateFlashcardsUseCase(
      repositories.flashcard,
      repositories.category,
    );

    const result = await useCase.execute({
      userId: user.id,
      categoryId,
      flashcards,
    });

    // Invalidate dashboard stats cache since flashcard count changed
    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
