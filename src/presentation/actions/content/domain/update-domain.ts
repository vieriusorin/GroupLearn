"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { UpdateDomainResult } from "@/application/dtos/content.dto";
import { updateDomainCommand } from "@/commands/content/UpdateDomain.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateDomain(
  domainId: number,
  name?: string,
  description?: string | null,
): Promise<ActionResult<UpdateDomainResult["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!domainId || domainId <= 0) {
      return {
        success: false,
        error: "Invalid domain ID",
        code: "VALIDATION_ERROR",
      };
    }

    const command = updateDomainCommand(user.id, domainId, name, description);
    const result = await commandHandlers.content.updateDomain.execute(command);

    revalidatePath("/admin/domains");
    revalidatePath("/domains");
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
