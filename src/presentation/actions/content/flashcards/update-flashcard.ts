"use server";

import { revalidateTag } from "next/cache";
import type { UpdateFlashcardResult } from "@/application/dtos/content.dto";
import { updateFlashcardCommand } from "@/commands/content/UpdateFlashcard.command";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateFlashcard(
  flashcardId: number,
  question?: string,
  answer?: string,
  difficulty?: DifficultyLevelType,
): Promise<ActionResult<UpdateFlashcardResult["data"]>> {
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

    const command = updateFlashcardCommand(
      user.id,
      flashcardId,
      question,
      answer,
      difficulty,
    );
    const result =
      await commandHandlers.content.updateFlashcard.execute(command);

    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
