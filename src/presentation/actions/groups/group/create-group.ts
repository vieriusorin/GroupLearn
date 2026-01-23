"use server";

import type { GroupListItem } from "@/application/dtos/groups.dto";
import { createGroupCommand } from "@/commands/groups/CreateGroup.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createGroup(
  name: string,
  description?: string | null,
): Promise<ActionResult<GroupListItem>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return {
        success: false,
        error: "Group name is required",
        code: "VALIDATION_ERROR",
      };
    }

    const command = createGroupCommand(
      user.id,
      name.trim(),
      description?.trim() || null,
    );
    const result = await commandHandlers.groups.createGroup.execute(command);

    return {
      success: true,
      data: result.group,
    };
  });
}
