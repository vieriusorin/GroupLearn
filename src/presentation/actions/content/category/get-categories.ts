"use server";

import type { Category } from "@/domains/content/entities/Category";
import { DomainId } from "@/domains/shared/types/branded-types";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult, AdminCategoryDto } from "@/presentation/types";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getCategories(
  domainId: number,
): Promise<ActionResult<AdminCategoryDto[]>> {
  return withAuth(["admin", "member"], async (_user) => {
    const domainIdTyped = DomainId(domainId);
    const categories = await repositories.category.findByDomain(domainIdTyped);

    const categoriesData: AdminCategoryDto[] = categories.map(
      (category: Category) => ({
        id: category.getId() as number,
        domainId: category.getDomainId() as number,
        name: category.getName(),
        description: category.getDescription(),
        isDeprecated: category.getIsDeprecated(),
        createdAt: category.getCreatedAt().toISOString(),
      }),
    );

    return {
      success: true,
      data: categoriesData,
    };
  });
}
