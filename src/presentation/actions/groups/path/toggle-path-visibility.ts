"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { togglePathVisibilityCommand } from "@/commands/groups/TogglePathVisibility.command";
import { commandHandlers } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function togglePathVisibility(
  groupId: number,
  pathId: number,
  isVisible: boolean,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const command = togglePathVisibilityCommand(
        user.id,
        groupId,
        pathId,
        isVisible,
      );
      await commandHandlers.groups.togglePathVisibility.execute(command);

      revalidatePath(`/admin/groups/${groupId}/paths`);
      revalidatePath(`/groups/${groupId}`);
      revalidateTag(CACHE_TAGS.paths, { expire: 0 });

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error toggling path visibility:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle path visibility",
      };
    }
  });
}
