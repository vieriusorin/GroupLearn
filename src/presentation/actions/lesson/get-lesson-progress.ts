"use server";

import type { GetLessonProgressResult } from "@/application/dtos/learning-path.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLessonProgressQuery } from "@/queries/lesson/GetLessonProgress.query";

export async function getLessonProgress(
  lessonId: number,
  pathId: number,
): Promise<ActionResult<GetLessonProgressResult>> {
  return withAuth(["admin", "member"], async (user) => {
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

    const query = getLessonProgressQuery(user.id, lessonId, pathId);
    const result = await queryHandlers.lesson.getLessonProgress.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
