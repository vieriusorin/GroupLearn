"use server";

import { revalidateTag } from "next/cache";
import type { CompleteLessonResult } from "@/application/dtos/learning-path.dto";
import { completeLessonCommand } from "@/commands/lesson/CompleteLesson.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function completeLesson(
  lessonId: number,
  pathId: number,
  timeSpentSeconds: number,
  accuracyPercent?: number,
  heartsRemaining?: number,
): Promise<ActionResult<CompleteLessonResult>> {
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

    if (timeSpentSeconds < 0) {
      return {
        success: false,
        error: "Time spent cannot be negative",
        code: "VALIDATION_ERROR",
      };
    }

    const command = completeLessonCommand(
      user.id,
      lessonId,
      pathId,
      accuracyPercent !== undefined ? accuracyPercent : 0,
      heartsRemaining !== undefined ? heartsRemaining : 0,
      0,
      false,
      timeSpentSeconds,
    );
    const result = await commandHandlers.lesson.completeLesson.execute(command);

    revalidateTag(CACHE_TAGS.paths, { expire: 0 });
    revalidateTag("leaderboard:all-time", { expire: 0 });
    revalidateTag("leaderboard:7days", { expire: 0 });
    revalidateTag("leaderboard:30days", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
