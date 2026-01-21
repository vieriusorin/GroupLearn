"use server";

import type { GetLessonProgressResponse } from "@/application/use-cases/lesson/GetLessonProgressUseCase";
import { GetLessonProgressUseCase } from "@/application/use-cases/lesson/GetLessonProgressUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

/**
 * Server Action: Get current progress for a lesson
 *
 * This can be used in Server Components for SSR or called from Client Components.
 *
 * @param lessonId - The lesson ID
 * @param pathId - The path ID that contains the lesson
 * @returns ActionResult with lesson progress data or error
 */
export async function getLessonProgress(
  lessonId: number,
  pathId: number,
): Promise<ActionResult<GetLessonProgressResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    // Validate input
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    // Execute use case
    const useCase = new GetLessonProgressUseCase(
      repositories.lesson,
      repositories.lessonCompletion,
      repositories.userProgress,
    );

    const result = await useCase.execute({
      userId: user.id,
      lessonId,
      pathId,
    });

    // Return success
    return {
      success: true,
      data: result,
    };
  });
}
