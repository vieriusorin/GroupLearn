"use server";

import type { GetLessonFlashcardsResponse } from "@/application/use-cases/lesson/GetLessonFlashcardsUseCase";
import { GetLessonFlashcardsUseCase } from "@/application/use-cases/lesson/GetLessonFlashcardsUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

/**
 * Server Action: Get all flashcards for a lesson
 *
 * This can be used in Server Components for SSR or called from Client Components.
 *
 * @param lessonId - The lesson ID
 * @returns ActionResult with lesson flashcards data or error
 */
export async function getLessonFlashcards(
  lessonId: number,
): Promise<ActionResult<GetLessonFlashcardsResponse>> {
  return withAuth(["admin", "member"], async (_user) => {
    // Validate input
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    // Execute use case
    const useCase = new GetLessonFlashcardsUseCase(repositories.lesson);

    const result = await useCase.execute({
      lessonId,
    });

    // Return success
    return {
      success: true,
      data: result,
    };
  });
}
