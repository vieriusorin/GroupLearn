"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { CreateCategoryResult } from "@/application/dtos/content.dto";
import { createCategoryCommand } from "@/commands/content/CreateCategory.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createCategory(
  domainId: number,
  name: string,
  description?: string | null,
): Promise<ActionResult<CreateCategoryResult["data"]>> {
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

    const command = createCategoryCommand(
      user.id,
      domainId,
      name.trim(),
      description?.trim() || null,
    );
    const result =
      await commandHandlers.content.createCategory.execute(command);

    // Revalidate paths
    revalidatePath("/admin/categories");
    revalidatePath("/admin/flashcards");

    // Revalidate cache tags
    revalidateTag(CACHE_TAGS.categories(domainId), "default");
    revalidateTag(CACHE_TAGS.categoriesAll, "default");

    return {
      success: true,
      data: result.data,
    };
  });
}
