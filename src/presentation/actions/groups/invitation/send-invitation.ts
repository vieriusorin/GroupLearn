"use server";

import { revalidatePath } from "next/cache";
import type { SendInvitationResult } from "@/application/dtos/groups.dto";
import { sendInvitationCommand } from "@/commands/groups/SendInvitation.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function sendInvitation(
  groupId: number,
  email: string,
  role: "member" | "admin",
  pathIds: number[] = [],
): Promise<ActionResult<SendInvitationResult>> {
  return withAuth(["admin", "member"], async (user) => {
    const command = sendInvitationCommand(
      user.id,
      groupId,
      email,
      role,
      pathIds.length > 0 ? pathIds : undefined,
    );
    const result = await commandHandlers.groups.sendInvitation.execute(command);

    revalidatePath(`/admin/groups/${groupId}`);

    return {
      success: true,
      data: result,
    };
  });
}
