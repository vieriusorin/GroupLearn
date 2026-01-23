"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { removePathCommand } from "@/commands/groups/RemovePath.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function removePath(
  groupId: number,
  pathId: number,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const command = removePathCommand(user.id, groupId, pathId);
      await commandHandlers.groups.removePath.execute(command);

      revalidatePath(`/admin/groups/${groupId}/paths`);
      revalidatePath(`/groups/${groupId}`);
      revalidateTag(CACHE_TAGS.paths, { expire: 0 });

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error removing path:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove path",
      };
    }
  });
}
