"use server";

import type { GetDueCardsResponse } from "@/application/use-cases/review/GetDueCardsUseCase";
import { GetDueCardsUseCase } from "@/application/use-cases/review/GetDueCardsUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getDueCards(
  limit?: number,
): Promise<ActionResult<GetDueCardsResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    const useCase = new GetDueCardsUseCase(
      repositories.reviewHistory,
      repositories.flashcard,
    );

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
