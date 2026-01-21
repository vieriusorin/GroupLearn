"use server";

import type { DeleteCategoryResponse } from "@/application/use-cases/content/DeleteCategoryUseCase";
import { DeleteCategoryUseCase } from "@/application/use-cases/content/DeleteCategoryUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteCategory(
  categoryId: number,
): Promise<ActionResult<DeleteCategoryResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "Invalid category ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new DeleteCategoryUseCase(
      repositories.category,
      repositories.flashcard,
    );

    const result = await useCase.execute({
      userId: user.id,
      categoryId,
    });

    return {
      success: true,
      data: result,
    };
  });
}
