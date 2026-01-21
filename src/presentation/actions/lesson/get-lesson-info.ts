"use server";

import {
  getLessonById,
  getUnitById,
} from "@/lib/db-operations-paths-critical-converted";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

/**
 * Server Action: Get lesson info including pathId
 *
 * @param lessonId - The lesson ID
 * @returns ActionResult with lesson info including pathId or error
 */
export async function getLessonInfo(lessonId: number): Promise<
  ActionResult<{
    lessonId: number;
    unitId: number;
    pathId: number;
  }>
> {
  return withAuth(["admin", "member"], async () => {
    // Validate input
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    try {
      // Get lesson to find unit ID
      const lesson = await getLessonById(lessonId);
      if (!lesson) {
        return {
          success: false,
          error: "Lesson not found",
          code: "NOT_FOUND",
        };
      }

      // Get unit to find path ID
      const unit = await getUnitById(lesson.unit_id);
      if (!unit) {
        return {
          success: false,
          error: "Unit not found",
          code: "NOT_FOUND",
        };
      }

      return {
        success: true,
        data: {
          lessonId: lesson.id,
          unitId: lesson.unit_id,
          pathId: unit.path_id,
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
