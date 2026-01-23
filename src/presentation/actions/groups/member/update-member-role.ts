"use server";

import { revalidatePath } from "next/cache";
import { updateMemberRoleCommand } from "@/commands/groups/UpdateMemberRole.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateMemberRole(
  groupId: number,
  userId: number,
  role: "member" | "admin",
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const command = updateMemberRoleCommand(user.id, groupId, userId, role);
      await commandHandlers.groups.updateMemberRole.execute(command);

      revalidatePath(`/admin/groups/${groupId}`);
      revalidatePath("/groups");

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error updating member role:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update member role",
      };
    }
  });
}
