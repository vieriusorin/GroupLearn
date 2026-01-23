"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { DeleteResult } from "@/application/dtos/content.dto";
import { deleteCategoryCommand } from "@/commands/content/DeleteCategory.command";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getCategoryByIdQuery } from "@/queries/content/GetCategoryById.query";

export async function deleteCategory(
  categoryId: number,
): Promise<ActionResult<DeleteResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "Invalid category ID",
        code: "VALIDATION_ERROR",
      };
    }

    // Get category first to get domainId for cache invalidation
    const categoryQuery = getCategoryByIdQuery(categoryId);
    const category =
      await queryHandlers.content.getCategoryById.execute(categoryQuery);
    const domainId = category?.domainId;

    const command = deleteCategoryCommand(user.id, categoryId);
    const result =
      await commandHandlers.content.deleteCategory.execute(command);

    // Revalidate paths
    revalidatePath("/admin/categories");
    revalidatePath("/admin/flashcards");

    // Revalidate cache tags
    if (domainId) {
      revalidateTag(CACHE_TAGS.categories(domainId), "default");
    }
    revalidateTag(CACHE_TAGS.categoriesAll, "default");

    return {
      success: true,
      data: result,
    };
  });
}
