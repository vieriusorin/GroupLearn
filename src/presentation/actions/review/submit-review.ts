"use server";

import { revalidateTag } from "next/cache";
import type { SubmitReviewResponse } from "@/application/use-cases/review/SubmitReviewUseCase";
import { SubmitReviewUseCase } from "@/application/use-cases/review/SubmitReviewUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function submitReview(
  sessionId: string,
  flashcardId: number,
  isCorrect: boolean,
): Promise<ActionResult<SubmitReviewResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!sessionId || sessionId.trim().length === 0) {
      return {
        success: false,
        error: "Session ID is required",
        code: "VALIDATION_ERROR",
      };
    }

    if (!flashcardId || flashcardId <= 0) {
      return {
        success: false,
        error: "Invalid flashcard ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new SubmitReviewUseCase(
      repositories.reviewHistory,
      repositories.session,
    );

    const result = await useCase.execute({
      userId: user.id,
      sessionId,
      flashcardId,
      isCorrect,
    });

    // Invalidate dashboard stats cache since review affects stats
    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
