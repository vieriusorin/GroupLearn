"use server";

import { revalidatePath } from "next/cache";
import type { AcceptInvitationResult } from "@/application/dtos/groups.dto";
import { acceptInvitationCommand } from "@/commands/groups/AcceptInvitation.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function acceptInvitationAction(
  token: string,
): Promise<ActionResult<AcceptInvitationResult>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const command = acceptInvitationCommand(user.id, token);
      const result =
        await commandHandlers.groups.acceptInvitation.execute(command);

      revalidatePath("/groups");
      revalidatePath(`/groups/${result.group.id}`);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error accepting invitation:", error);

      if (error instanceof Error && "code" in error) {
        return {
          success: false,
          error: error.message,
          code: error.code as string,
        };
      }

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to accept invitation",
      };
    }
  });
}
