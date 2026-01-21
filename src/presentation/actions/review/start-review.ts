"use server";

import type { StartReviewSessionResponse } from "@/application/use-cases/review/StartReviewSessionUseCase";
import { StartReviewSessionUseCase } from "@/application/use-cases/review/StartReviewSessionUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function startReview(
  mode?: "flashcard" | "quiz" | "recall",
  limit?: number,
): Promise<ActionResult<StartReviewSessionResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    const useCase = new StartReviewSessionUseCase(
      repositories.reviewHistory,
      repositories.flashcard,
    );

    const result = await useCase.execute({
      userId: user.id,
      mode: mode || "flashcard",
      limit,
    });

    return {
      success: true,
      data: result,
    };
  });
}
