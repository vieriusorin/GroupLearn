"use server";

import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLessonByIdQuery } from "@/queries/paths/GetLessonById.query";
import { getNextLessonAfterCompletionQuery } from "@/queries/paths/GetNextLessonAfterCompletion.query";
import { getUnitByIdQuery } from "@/queries/paths/GetUnitById.query";
import { isPathCompletedQuery } from "@/queries/paths/IsPathCompleted.query";
import { isUnitCompletedQuery } from "@/queries/paths/IsUnitCompleted.query";

export type CompletionContext = {
  unitCompleted: boolean;
  pathCompleted: boolean;
  nextLessonId: number | null;
};

export async function getCompletionContext(
  lessonId: number,
): Promise<ActionResult<CompletionContext>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    try {
      // Get lesson info to find unitId
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

      const lesson = lessonResult.lesson;

      // Get unit info to find pathId
      const unitQuery = getUnitByIdQuery(lesson.unitId);
      const unitResult =
        await queryHandlers.paths.getUnitById.execute(unitQuery);

      if (!unitResult.unit) {
        return {
          success: false,
          error: "Unit not found",
          code: "NOT_FOUND",
        };
      }

      const unit = unitResult.unit;

      // Check unit and path completion
      const [unitCompleted, pathCompleted, nextLesson] = await Promise.all([
        queryHandlers.paths.isUnitCompleted.execute(
          isUnitCompletedQuery(unit.id, user.id),
        ),
        queryHandlers.paths.isPathCompleted.execute(
          isPathCompletedQuery(unit.pathId, user.id),
        ),
        queryHandlers.paths.getNextLessonAfterCompletion.execute(
          getNextLessonAfterCompletionQuery(lessonId),
        ),
      ]);

      return {
        success: true,
        data: {
          unitCompleted,
          pathCompleted,
          nextLessonId: nextLesson?.id ?? null,
        },
      };
    } catch (error) {
      console.error("Error getting completion context:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get completion context",
      };
    }
  });
}
