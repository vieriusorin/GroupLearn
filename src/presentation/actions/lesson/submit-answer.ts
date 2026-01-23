"use server";

import type { SubmitAnswerResult } from "@/application/dtos/learning-path.dto";
import { submitAnswerCommand } from "@/commands/lesson/SubmitAnswer.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function submitAnswer(
  lessonId: number,
  flashcardId: number,
  isCorrect: boolean,
  timeSpentSeconds?: number,
): Promise<ActionResult<SubmitAnswerResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
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

    const command = submitAnswerCommand(
      user.id,
      lessonId,
      flashcardId,
      isCorrect,
      timeSpentSeconds,
    );
    const result = await commandHandlers.lesson.submitAnswer.execute(command);

    return {
      success: true,
      data: result,
    };
  });
}
