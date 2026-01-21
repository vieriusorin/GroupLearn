"use server";

import type { CreateCategoryResponse } from "@/application/use-cases/content/CreateCategoryUseCase";
import { CreateCategoryUseCase } from "@/application/use-cases/content/CreateCategoryUseCase";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createCategory(
  domainId: number,
  name: string,
  description?: string | null,
): Promise<ActionResult<CreateCategoryResponse["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!domainId || domainId <= 0) {
      return {
        success: false,
        error: "Invalid domain ID",
        code: "VALIDATION_ERROR",
      };
    }

    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: "Category name is required",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new CreateCategoryUseCase(
      repositories.category,
      repositories.domain,
    );

    const result = await useCase.execute({
      userId: user.id,
      domainId,
      name: name.trim(),
      description: description?.trim() || null,
    });

    return {
      success: true,
      data: result.data,
    };
  });
}
