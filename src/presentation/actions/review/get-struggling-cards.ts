"use server";

import type { GetStrugglingCardsResult } from "@/application/dtos/review.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getStrugglingCardsQuery } from "@/queries/review/GetStrugglingCards.query";

export async function getStrugglingCards(
  limit?: number,
): Promise<ActionResult<GetStrugglingCardsResult>> {
  return withAuth(["admin", "member"], async (user) => {
    const query = getStrugglingCardsQuery(user.id, limit);
    const result = await queryHandlers.review.getStrugglingCards.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
