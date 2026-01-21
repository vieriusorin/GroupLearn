"use server";

import { revalidateTag } from "next/cache";
import {
  CompleteLessonUseCase,
  type CompleteLessonResponse,
} from "@/application/use-cases/lesson/CompleteLessonUseCase";
import { repositories } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

/**
 * Server Action: Complete a lesson
 *
 * @param lessonId - The lesson ID to complete
 * @param pathId - The path ID that contains the lesson
 * @param timeSpentSeconds - Total time spent on the lesson
 * @param accuracyPercent - Optional accuracy percentage (if not provided, will be calculated from session)
 * @param heartsRemaining - Optional hearts remaining (if not provided, will be loaded from session)
 * @returns ActionResult with completion data or error
 */
export async function completeLesson(
  lessonId: number,
  pathId: number,
  timeSpentSeconds: number,
  accuracyPercent?: number,
  heartsRemaining?: number,
): Promise<ActionResult<CompleteLessonResponse["data"]>> {
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

    if (timeSpentSeconds < 0) {
      return {
        success: false,
        error: "Time spent cannot be negative",
        code: "VALIDATION_ERROR",
      };
    }

    // Execute use case
    const useCase = new CompleteLessonUseCase(
      repositories.session,
      repositories.lessonCompletion,
      repositories.userProgress,
    );

    // The use case loads the session and extracts all needed data from it
    // If accuracyPercent or heartsRemaining are provided, they override session values
    const result = await useCase.execute({
      userId: user.id,
      lessonId,
      pathId,
      accuracy: accuracyPercent !== undefined ? accuracyPercent : 0, // Will be calculated from session if 0
      heartsRemaining: heartsRemaining !== undefined ? heartsRemaining : 0, // Will be loaded from session if 0
      cardsReviewed: 0, // Loaded from session in use case
      isPerfect: false, // Calculated from session in use case
      timeSpentSeconds,
    });

    // Invalidate cached path/units/lessons progress for this user
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });
    // Invalidate XP history and leaderboard caches since XP was awarded
    revalidateTag("leaderboard:all-time", { expire: 0 });
    revalidateTag("leaderboard:7days", { expire: 0 });
    revalidateTag("leaderboard:30days", { expire: 0 });

    // Return success
    return {
      success: true,
      data: result.data,
    };
  });
}
