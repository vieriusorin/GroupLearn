"use server";

import { revalidateTag } from "next/cache";
import type { SubmitReviewResult } from "@/application/dtos/review.dto";
import { submitReviewCommand } from "@/commands/review/SubmitReview.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function submitReview(
  sessionId: string,
  flashcardId: number,
  isCorrect: boolean,
): Promise<ActionResult<SubmitReviewResult>> {
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

    const command = submitReviewCommand(
      user.id,
      sessionId,
      flashcardId,
      isCorrect,
    );
    const result = await commandHandlers.review.submitReview.execute(command);

    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
