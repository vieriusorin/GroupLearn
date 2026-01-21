"use server";

import { CategoryId } from "@/domains/shared/types/branded-types";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult, AdminFlashcardDto } from "@/presentation/types";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getFlashcards(
  categoryId?: number,
  page: number = 1,
  limit: number = 20,
): Promise<
  ActionResult<{
    flashcards: AdminFlashcardDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>
> {
  return withAuth(["admin", "member"], async (_user) => {
    let result;

    if (categoryId) {
      const categoryIdTyped = CategoryId(categoryId);
      result = await repositories.flashcard.findByCategoryPaginated(
        categoryIdTyped,
        { page, limit },
      );
    } else {
      result = await repositories.flashcard.search("", { page, limit });
    }

    const resultAny = result as any;
    const flashcards = resultAny.data || resultAny.items;
    const flashcardsData: AdminFlashcardDto[] = flashcards.map(
      (flashcard: any) => ({
        id: flashcard.getId() as number,
        categoryId: flashcard.getCategoryId() as number,
        question: flashcard.getQuestion(),
        answer: flashcard.getAnswer(),
        difficulty: flashcard.getDifficulty(),
        computedDifficulty: flashcard.getComputedDifficulty(),
        createdAt: flashcard.getCreatedAt().toISOString(),
      }),
    );

    const pagination = resultAny.pagination || {
      page: resultAny.page,
      limit: resultAny.limit,
      total: resultAny.total,
      totalPages: resultAny.totalPages,
    };

    return {
      success: true,
      data: {
        flashcards: flashcardsData,
        pagination,
      },
    };
  });
}
