"use server";

import { revalidateTag } from "next/cache";
import type { UpdateStreakResponse } from "@/application/use-cases/progress/UpdateStreakUseCase";
import { UpdateStreakUseCase } from "@/application/use-cases/progress/UpdateStreakUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateStreak(
  pathId: number,
): Promise<ActionResult<UpdateStreakResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new UpdateStreakUseCase(repositories.userProgress);

    const result = await useCase.execute({
      userId: user.id,
      pathId,
    });

    revalidateTag("user-progress", { expire: 0 });
    revalidateTag("user-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
