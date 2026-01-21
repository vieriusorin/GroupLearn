"use server";

import type { StartLessonResponse } from "@/application/use-cases/lesson/StartLessonUseCase";
import { StartLessonUseCase } from "@/application/use-cases/lesson/StartLessonUseCase";
import { repositories } from "@/infrastructure/di/container";
import { canAccessPath } from "@/lib/authorization";
import {
  getLessonById,
  getPathById,
  getUnitById,
} from "@/lib/db-operations-paths-critical-converted";
import { isLessonUnlocked } from "@/lib/unlock-system";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

/**
 * Server Action: Start a lesson
 *
 * @param lessonId - The lesson ID to start
 * @returns ActionResult with session data or error
 */
export async function startLesson(lessonId: number): Promise<
  ActionResult<{
    lesson: StartLessonResponse["lesson"];
    unit: StartLessonResponse["unit"];
    path: StartLessonResponse["path"];
    flashcards: StartLessonResponse["flashcards"];
    hearts_available: number;
    review_mode: "flashcard" | "quiz" | "recall";
    total_flashcards: number;
    xp_reward: number;
  }>
> {
  return withAuth(["admin", "member"], async (user) => {
    // Validate input
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

    // Get lesson to find path ID
    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return {
        success: false,
        error: "Lesson not found",
        code: "NOT_FOUND",
      };
    }

    // Check if lesson is unlocked
    if (!(await isLessonUnlocked(lessonId, user.id))) {
      return {
        success: false,
        error: "Lesson is locked. Complete previous lessons first.",
        code: "LESSON_LOCKED",
      };
    }

    // Get unit and path info
    const unit = await getUnitById(lesson.unit_id);
    if (!unit) {
      return {
        success: false,
        error: "Unit not found",
        code: "NOT_FOUND",
      };
    }

    const path = await getPathById(unit.path_id);
    if (!path) {
      return {
        success: false,
        error: "Path not found",
        code: "NOT_FOUND",
      };
    }

    // Check if user has access to this path
    const hasAccess = await canAccessPath(path.id);
    if (!hasAccess) {
      return {
        success: false,
        error: "You do not have access to this path",
        code: "FORBIDDEN",
      };
    }

    // Execute use case
    const useCase = new StartLessonUseCase(
      repositories.lesson,
      repositories.session,
      repositories.userProgress,
    );

    const result = await useCase.execute({
      userId: user.id,
      lessonId,
      pathId: path.id,
      lesson: {
        id: lesson.id,
        unit_id: lesson.unit_id,
        name: lesson.name,
        description: lesson.description,
        order_index: lesson.order_index,
        xp_reward: lesson.xp_reward,
        flashcard_count: lesson.flashcard_count,
        created_at: lesson.created_at,
      },
      unit: {
        id: unit.id,
        path_id: unit.path_id,
        name: unit.name,
        description: unit.description,
        unit_number: unit.unit_number,
        order_index: unit.order_index,
        xp_reward: unit.xp_reward,
        created_at: unit.created_at || new Date().toISOString(),
      },
      path: {
        id: path.id,
        domain_id: path.domain_id,
        name: path.name,
        description: path.description,
        icon: path.icon,
        order_index: path.order_index,
        is_locked: path.is_locked,
        unlock_requirement_type: path.unlock_requirement_type,
        unlock_requirement_value: path.unlock_requirement_value,
        visibility: path.visibility,
        created_by: path.created_by,
        created_at: path.created_at,
      },
    });

    // Return success - map to client-expected format
    return {
      success: true,
      data: {
        lesson: result.lesson,
        unit: result.unit,
        path: result.path,
        flashcards: result.flashcards,
        hearts_available: result.hearts_available,
        review_mode: result.review_mode,
        total_flashcards: result.flashcards.length,
        xp_reward: result.lesson.xp_reward,
      },
    };
  });
}
