"use server";

import { canAccessPath } from "@/lib/authorization";
import {
  getCachedLessonsWithProgress,
  getUnitById,
} from "@/lib/db-operations-paths-critical-converted";
import type { LessonWithProgress } from "@/lib/types";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

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

    const unit = await getUnitById(unitId);
    if (!unit) {
      return {
        success: false,
        error: "Unit not found",
        code: "NOT_FOUND",
      };
    }

    const canAccess = await canAccessPath(unit.path_id);
    if (!canAccess) {
      return {
        success: false,
        error: "Forbidden: You do not have access to this path",
        code: "FORBIDDEN",
      };
    }

    try {
      const lessons = await getCachedLessonsWithProgress(unitId, user.id);
      return {
        success: true,
        data: lessons,
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
