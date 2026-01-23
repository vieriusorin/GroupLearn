"use server";

import { revalidatePath } from "next/cache";
import { removeMemberCommand } from "@/commands/groups/RemoveMember.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function removeMember(
  groupId: number,
  userId: number,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const command = removeMemberCommand(user.id, groupId, userId);
      await commandHandlers.groups.removeMember.execute(command);

      revalidatePath(`/admin/groups/${groupId}`);
      revalidatePath("/groups");

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error removing member:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove member",
      };
    }
  });
}
