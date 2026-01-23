"use server";

import type { LessonWithProgress } from "@/application/dtos";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLessonsQuery } from "@/queries/paths/GetLessons.query";

export async function getLessons(
  unitId: number,
): Promise<ActionResult<LessonWithProgress[]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!unitId || unitId <= 0) {
      return {
        success: false,
        error: "Invalid unit ID",
        code: "VALIDATION_ERROR",
      };
    }

    try {
      const query = getLessonsQuery(user.id, unitId);
      const result = await queryHandlers.paths.getLessons.execute(query);

      return {
        success: true,
        data: result.lessons,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch lessons",
        code: "FETCH_ERROR",
      };
    }
  });
}
