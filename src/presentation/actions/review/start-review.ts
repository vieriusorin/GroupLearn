"use server";

import type { StartReviewSessionResult } from "@/application/dtos/review.dto";
import { startReviewSessionCommand } from "@/commands/review/StartReviewSession.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function startReview(
  mode?: "flashcard" | "quiz" | "recall",
  limit?: number,
): Promise<ActionResult<StartReviewSessionResult>> {
  return withAuth(["admin", "member"], async (user) => {
    const command = startReviewSessionCommand(
      user.id,
      mode || "flashcard",
      limit,
    );
    const result =
      await commandHandlers.review.startReviewSession.execute(command);

    return {
      success: true,
      data: result,
    };
  });
}
