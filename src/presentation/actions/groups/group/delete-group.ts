"use server";

import type { SuccessResult } from "@/application/dtos/groups.dto";
import { deleteGroupCommand } from "@/commands/groups/DeleteGroup.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteGroup(
  groupId: number,
): Promise<ActionResult<SuccessResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!groupId || groupId <= 0) {
      return {
        success: false,
        error: "Invalid group ID",
        code: "VALIDATION_ERROR",
      };
    }

    const command = deleteGroupCommand(user.id, groupId);
    const result = await commandHandlers.groups.deleteGroup.execute(command);

    return {
      success: true,
      data: result,
    };
  });
}
