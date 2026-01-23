"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { UpdateCategoryResult } from "@/application/dtos/content.dto";
import { updateCategoryCommand } from "@/commands/content/UpdateCategory.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateCategory(
  categoryId: number,
  name?: string,
  description?: string | null,
): Promise<ActionResult<UpdateCategoryResult["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!categoryId || categoryId <= 0) {
      return {
        success: false,
        error: "Invalid category ID",
        code: "VALIDATION_ERROR",
      };
    }

    const command = updateCategoryCommand(
      user.id,
      categoryId,
      name,
      description,
    );
    const result =
      await commandHandlers.content.updateCategory.execute(command);

    const domainId = result.data.domainId;

    revalidatePath("/admin/categories");
    revalidatePath("/admin/flashcards");

    revalidateTag(CACHE_TAGS.categories(domainId), { expire: 0 });
    revalidateTag(CACHE_TAGS.categoriesAll, { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
