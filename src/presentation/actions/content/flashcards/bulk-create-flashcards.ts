"use server";

import { revalidateTag } from "next/cache";
import type { BulkCreateFlashcardsResult } from "@/application/dtos/content.dto";
import { bulkCreateFlashcardsCommand } from "@/commands/content/BulkCreateFlashcards.command";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function bulkCreateFlashcards(
  categoryId: number,
  flashcards: Array<{
    question: string;
    answer: string;
    difficulty?: DifficultyLevelType;
  }>,
): Promise<ActionResult<BulkCreateFlashcardsResult>> {
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

    const command = bulkCreateFlashcardsCommand(
      user.id,
      categoryId,
      flashcards,
    );
    const result =
      await commandHandlers.content.bulkCreateFlashcards.execute(command);

    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
