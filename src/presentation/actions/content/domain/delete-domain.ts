"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { DeleteResult } from "@/application/dtos/content.dto";
import { deleteDomainCommand } from "@/commands/content/DeleteDomain.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteDomain(
  domainId: number,
): Promise<ActionResult<DeleteResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!domainId || domainId <= 0) {
      return {
        success: false,
        error: "Invalid domain ID",
        code: "VALIDATION_ERROR",
      };
    }

    const command = deleteDomainCommand(user.id, domainId);
    const result = await commandHandlers.content.deleteDomain.execute(command);

    revalidatePath("/admin/domains");
    revalidatePath("/domains");
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
