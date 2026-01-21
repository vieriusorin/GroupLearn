"use server";

import type { GetStrugglingCardsResponse } from "@/application/use-cases/review/GetStrugglingCardsUseCase";
import { GetStrugglingCardsUseCase } from "@/application/use-cases/review/GetStrugglingCardsUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getStrugglingCards(
  limit?: number,
): Promise<ActionResult<GetStrugglingCardsResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    const useCase = new GetStrugglingCardsUseCase(repositories.flashcard);

    const result = await useCase.execute({
      userId: user.id,
      limit,
    });

    return {
      success: true,
      data: result,
    };
  });
}
