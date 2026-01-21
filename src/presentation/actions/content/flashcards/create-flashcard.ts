"use server";

import { revalidateTag } from "next/cache";
import type { CreateFlashcardResponse } from "@/application/use-cases/content/CreateFlashcardUseCase";
import { CreateFlashcardUseCase } from "@/application/use-cases/content/CreateFlashcardUseCase";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createFlashcard(
  categoryId: number,
  question: string,
  answer: string,
  difficulty?: DifficultyLevelType,
): Promise<ActionResult<CreateFlashcardResponse["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "Invalid category ID",
        code: "VALIDATION_ERROR",
      };
    }

    if (!question || question.trim().length === 0) {
      return {
        success: false,
        error: "Question is required",
        code: "VALIDATION_ERROR",
      };
    }

    if (!answer || answer.trim().length === 0) {
      return {
        success: false,
        error: "Answer is required",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new CreateFlashcardUseCase(
      repositories.flashcard,
      repositories.category,
    );

    const result = await useCase.execute({
      userId: user.id,
      categoryId,
      question: question.trim(),
      answer: answer.trim(),
      difficulty: difficulty || "medium",
    });

    // Invalidate dashboard stats cache since flashcard count changed
    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
