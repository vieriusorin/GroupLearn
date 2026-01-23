"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { CreateDomainResult } from "@/application/dtos/content.dto";
import { createDomainCommand } from "@/commands/content/CreateDomain.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createDomain(
  name: string,
  description?: string | null,
): Promise<ActionResult<CreateDomainResult["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: "Domain name is required",
        code: "VALIDATION_ERROR",
      };
    }

    const command = createDomainCommand(
      user.id,
      name.trim(),
      description?.trim() || null,
    );

    const result = await commandHandlers.content.createDomain.execute(command);

    revalidatePath("/admin/domains");
    revalidatePath("/domains");
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
