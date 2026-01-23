"use server";

import type { GetLessonInfoResult } from "@/application/dtos/learning-path.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLessonByIdQuery } from "@/queries/paths/GetLessonById.query";
import { getUnitByIdQuery } from "@/queries/paths/GetUnitById.query";

export async function getLessonInfo(
  lessonId: number,
): Promise<ActionResult<GetLessonInfoResult>> {
  return withAuth(["admin", "member"], async () => {
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    try {
      const lessonQuery = getLessonByIdQuery(lessonId);
      const lessonResult =
        await queryHandlers.paths.getLessonById.execute(lessonQuery);

      if (!lessonResult.lesson) {
        return {
          success: false,
          error: "Lesson not found",
          code: "NOT_FOUND",
        };
      }

      const unitQuery = getUnitByIdQuery(lessonResult.lesson.unitId);
      const unitResult =
        await queryHandlers.paths.getUnitById.execute(unitQuery);

      if (!unitResult.unit) {
        return {
          success: false,
          error: "Unit not found",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: {
          lessonId: lessonResult.lesson.id,
          unitId: lessonResult.lesson.unitId,
          pathId: unitResult.unit.pathId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get lesson info",
        code: "FETCH_ERROR",
      };
    }
  });
}
