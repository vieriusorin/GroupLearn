"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { assignPathCommand } from "@/commands/groups/AssignPath.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function assignPath(
  groupId: number,
  pathId: number,
  isVisible: boolean = true,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const command = assignPathCommand(
        user.id,
        groupId,
        pathId,
        isVisible === false ? false : undefined,
      );
      await commandHandlers.groups.assignPath.execute(command);

      revalidatePath(`/admin/groups/${groupId}/paths`);
      revalidatePath(`/groups/${groupId}`);
      revalidateTag(CACHE_TAGS.paths, { expire: 0 });

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error assigning path:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to assign path",
      };
    }
  });
}
