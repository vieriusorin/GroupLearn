"use server";

import { revalidateTag } from "next/cache";
import type { DeleteResult } from "@/application/dtos/content.dto";
import { deleteFlashcardCommand } from "@/commands/content/DeleteFlashcard.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteFlashcard(
  flashcardId: number,
): Promise<ActionResult<DeleteResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!flashcardId || flashcardId <= 0) {
      return {
        success: false,
        error: "Invalid flashcard ID",
        code: "VALIDATION_ERROR",
      };
    }

    const command = deleteFlashcardCommand(user.id, flashcardId);
    const result =
      await commandHandlers.content.deleteFlashcard.execute(command);

    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
