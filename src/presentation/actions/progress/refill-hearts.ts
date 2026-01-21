"use server";

import { revalidateTag } from "next/cache";
import type { RefillHeartsResponse } from "@/application/use-cases/progress/RefillHeartsUseCase";
import { RefillHeartsUseCase } from "@/application/use-cases/progress/RefillHeartsUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function refillHearts(
  pathId: number,
): Promise<ActionResult<RefillHeartsResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new RefillHeartsUseCase(repositories.userProgress);

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
