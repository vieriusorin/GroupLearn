"use server";

import type { GetFlashcardsResult } from "@/application/dtos/content.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getFlashcardsQuery } from "@/queries/content/GetFlashcards.query";

export async function getFlashcards(
  categoryId?: number,
  page: number = 1,
  limit: number = 20,
): Promise<ActionResult<GetFlashcardsResult>> {
  return withAuth(["admin", "member"], async (_user) => {
    const query = getFlashcardsQuery(categoryId, page, limit);
    const result = await queryHandlers.content.getFlashcards.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
