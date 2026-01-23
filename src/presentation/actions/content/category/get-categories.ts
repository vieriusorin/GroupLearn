"use server";

import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult, AdminCategoryDto } from "@/presentation/types";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getCategoriesQuery } from "@/queries/content/GetCategories.query";

export async function getCategories(
  domainId: number,
): Promise<ActionResult<AdminCategoryDto[]>> {
  return withAuth(["admin", "member"], async (_user) => {
    const query = getCategoriesQuery(domainId);
    const result = await queryHandlers.content.getCategories.execute(query);

    const categoriesData: AdminCategoryDto[] = result.categories.map(
      (category) => ({
        id: category.id,
        domainId: category.domainId,
        name: category.name,
        description: category.description,
        isDeprecated: category.isDeprecated,
        createdAt: category.createdAt,
        flashcardCount: category.flashcardCount,
      }),
    );

    return {
      success: true,
      data: categoriesData,
    };
  });
}
