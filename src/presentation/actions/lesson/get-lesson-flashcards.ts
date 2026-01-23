"use server";

import type { GetLessonFlashcardsResult } from "@/application/dtos/learning-path.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLessonFlashcardsQuery } from "@/queries/lesson/GetLessonFlashcards.query";

export async function getLessonFlashcards(
  lessonId: number,
): Promise<ActionResult<GetLessonFlashcardsResult>> {
  return withAuth(["admin", "member"], async (_user) => {
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    const query = getLessonFlashcardsQuery(lessonId);
    const result =
      await queryHandlers.lesson.getLessonFlashcards.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
