"use server";

import { revalidatePath } from "next/cache";
import { revokeInvitationCommand } from "@/commands/groups/RevokeInvitation.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function revokeInvitation(
  groupId: number,
  invitationId: number,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    const command = revokeInvitationCommand(user.id, groupId, invitationId);
    await commandHandlers.groups.revokeInvitation.execute(command);

    revalidatePath(`/admin/groups/${groupId}`);

    return {
      success: true,
      data: undefined,
    };
  });
}
