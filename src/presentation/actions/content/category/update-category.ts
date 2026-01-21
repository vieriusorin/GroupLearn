"use server";

import type { UpdateCategoryResponse } from "@/application/use-cases/content/UpdateCategoryUseCase";
import { UpdateCategoryUseCase } from "@/application/use-cases/content/UpdateCategoryUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateCategory(
  categoryId: number,
  name?: string,
  description?: string | null,
): Promise<ActionResult<UpdateCategoryResponse["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "Invalid category ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new UpdateCategoryUseCase(repositories.category);

    const result = await useCase.execute({
      userId: user.id,
      categoryId,
      name,
      description,
    });

    return {
      success: true,
      data: result.data,
    };
  });
}
