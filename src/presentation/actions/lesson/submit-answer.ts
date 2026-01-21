"use server";

import {
  SubmitAnswerUseCase,
  type SubmitAnswerResponse,
} from "@/application/use-cases/lesson/SubmitAnswerUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

/**
 * Server Action: Submit an answer during a lesson
 *
 * @param lessonId - The lesson ID
 * @param flashcardId - The flashcard ID being answered
 * @param isCorrect - Whether the answer is correct
 * @param timeSpentSeconds - Optional time spent on the card
 * @returns ActionResult with answer result or error
 */
export async function submitAnswer(
  lessonId: number,
  flashcardId: number,
  isCorrect: boolean,
  timeSpentSeconds?: number,
): Promise<ActionResult<SubmitAnswerResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    // Validate input
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

    // Execute use case
    const useCase = new SubmitAnswerUseCase(repositories.session);

    const result = await useCase.execute({
      userId: user.id,
      lessonId,
      flashcardId,
      isCorrect,
      timeSpentSeconds,
    });

    // Return success
    return {
      success: true,
      data: result,
    };
  });
}
