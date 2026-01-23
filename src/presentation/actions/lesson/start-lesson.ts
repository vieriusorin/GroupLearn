"use server";

import type { StartLessonResponse } from "@/application/dtos/learning-path.dto";
import { startLessonCommand } from "@/commands/lesson/StartLesson.command";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import { canAccessPath } from "@/lib/auth/authorization";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLessonByIdQuery } from "@/queries/paths/GetLessonById.query";
import { getPathByIdQuery } from "@/queries/paths/GetPathById.query";
import { getUnitByIdQuery } from "@/queries/paths/GetUnitById.query";
import { isLessonUnlockedQuery } from "@/queries/paths/IsLessonUnlocked.query";

export async function startLesson(
  lessonId: number,
): Promise<ActionResult<StartLessonResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!lessonId || lessonId <= 0) {
      return {
        success: false,
        error: "Invalid lesson ID",
        code: "VALIDATION_ERROR",
      };
    }

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

    const isUnlocked = await queryHandlers.paths.isLessonUnlocked.execute(
      isLessonUnlockedQuery(lessonId, user.id),
    );
    if (!isUnlocked) {
      return {
        success: false,
        error: "Lesson is locked. Complete previous lessons first.",
        code: "LESSON_LOCKED",
      };
    }

    const unitQuery = getUnitByIdQuery(lesson.unitId);
    const unitResult = await queryHandlers.paths.getUnitById.execute(unitQuery);

    if (!unitResult.unit) {
      return {
        success: false,
        error: "Unit not found",
        code: "NOT_FOUND",
      };
    }

    const unit = unitResult.unit;

    const pathQuery = getPathByIdQuery(unit.pathId);
    const pathResult = await queryHandlers.paths.getPathById.execute(pathQuery);

    if (!pathResult.path) {
      return {
        success: false,
        error: "Path not found",
        code: "NOT_FOUND",
      };
    }

    const path = pathResult.path;

    const hasAccess = await canAccessPath(path.id);
    if (!hasAccess) {
      return {
        success: false,
        error: "You do not have access to this path",
        code: "FORBIDDEN",
      };
    }

    const command = startLessonCommand(
      user.id,
      lessonId,
      path.id,
      {
        id: lesson.id,
        unitId: lesson.unitId,
        name: lesson.name,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
        xpReward: lesson.xpReward,
        flashcardCount: lesson.flashcardCount,
        createdAt:
          lesson.createdAt instanceof Date
            ? lesson.createdAt.toISOString()
            : typeof lesson.createdAt === "string"
              ? lesson.createdAt
              : new Date().toISOString(),
      },
      {
        id: unit.id,
        pathId: unit.pathId,
        name: unit.name,
        description: unit.description,
        unitNumber: unit.unitNumber,
        orderIndex: unit.orderIndex,
        xpReward: unit.xpReward,
        createdAt:
          unit.createdAt instanceof Date
            ? unit.createdAt.toISOString()
            : typeof unit.createdAt === "string"
              ? unit.createdAt
              : new Date().toISOString(),
      },
      {
        id: path.id,
        domainId: path.domainId,
        name: path.name,
        description: path.description,
        icon: path.icon,
        orderIndex: path.orderIndex,
        isLocked: path.isLocked,
        unlockRequirementType: path.unlockRequirementType,
        unlockRequirementValue: path.unlockRequirementValue,
        visibility: path.visibility,
        createdBy: path.createdBy,
        createdAt:
          path.createdAt instanceof Date
            ? path.createdAt.toISOString()
            : typeof path.createdAt === "string"
              ? path.createdAt
              : new Date().toISOString(),
      },
    );

    const result = await commandHandlers.lesson.startLesson.execute(command);

    const response: StartLessonResponse = {
      lesson: result.lesson,
      unit: result.unit,
      path: result.path,
      flashcards: result.flashcards.map((f) => ({
        id: f.id,
        categoryId: f.categoryId,
        question: f.question,
        answer: f.answer,
        difficulty: f.difficulty as "easy" | "medium" | "hard",
        createdAt: f.createdAt,
        computedDifficulty: null,
      })),
      heartsAvailable: result.heartsAvailable,
      reviewMode:
        result.reviewMode === "flashcard"
          ? "learn"
          : result.reviewMode === "quiz"
            ? "review"
            : "cram",
      totalFlashcards: result.flashcards.length,
      xpReward: result.lesson.xpReward,
    };

    return {
      success: true,
      data: response,
    };
  });
}
