"use server";

import type { GetDueCardsResult } from "@/application/dtos/review.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getDueCardsQuery } from "@/queries/review/GetDueCards.query";

export async function getDueCards(
  limit?: number,
): Promise<ActionResult<GetDueCardsResult>> {
  return withAuth(["admin", "member"], async (user) => {
    const query = getDueCardsQuery(user.id, limit);
    const result = await queryHandlers.review.getDueCards.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
