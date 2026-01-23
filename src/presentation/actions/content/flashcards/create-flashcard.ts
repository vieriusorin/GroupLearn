"use server";

import { revalidateTag } from "next/cache";
import type { CreateFlashcardResult } from "@/application/dtos/content.dto";
import { createFlashcardCommand } from "@/commands/content/CreateFlashcard.command";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createFlashcard(
  categoryId: number,
  question: string,
  answer: string,
  difficulty?: DifficultyLevelType,
): Promise<ActionResult<CreateFlashcardResult["data"]>> {
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

    const command = createFlashcardCommand(
      user.id,
      categoryId,
      question.trim(),
      answer.trim(),
      difficulty || "medium",
    );
    const result =
      await commandHandlers.content.createFlashcard.execute(command);

    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
