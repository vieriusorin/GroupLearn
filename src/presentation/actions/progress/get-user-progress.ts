"use server";

import { unstable_cache } from "next/cache";
import type { GetUserProgressResult } from "@/application/dtos/gamification.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getUserProgressQuery } from "@/queries/progress/GetUserProgress.query";

const getCachedUserProgress = unstable_cache(
  async (userId: string, pathId: number) => {
    const query = getUserProgressQuery(userId, pathId);
    return queryHandlers.progress.getUserProgress.execute(query);
  },
  ["user-progress"],
  {
    tags: ["user-progress"],
  },
);

export async function getUserProgress(
  pathId: number,
): Promise<ActionResult<GetUserProgressResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    const result = await getCachedUserProgress(user.id, pathId);

    return {
      success: true,
      data: result,
    };
  });
}
