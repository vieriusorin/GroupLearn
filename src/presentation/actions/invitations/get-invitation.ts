"use server";

import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withOptionalAuth } from "@/presentation/utils/action-wrapper";
import { getInvitationQuery } from "@/queries/groups/GetInvitation.query";
import type { InvitationData } from "@/types/invitation";

export async function getInvitation(
  token: string,
): Promise<ActionResult<InvitationData>> {
  return withOptionalAuth<InvitationData>(async (_user) => {
    if (!token || token.trim().length === 0) {
      return {
        success: false,
        error: "Token is required",
        code: "VALIDATION_ERROR",
      };
    }

    try {
      const query = getInvitationQuery(token);
      const result = await queryHandlers.groups.getInvitation.execute(query);

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch invitation";

      return {
        success: false,
        error: errorMessage,
        code: errorMessage.includes("not found")
          ? "NOT_FOUND"
          : "VALIDATION_ERROR",
        data: {
          valid: false,
          error: "validation_error",
          message: errorMessage,
        },
      };
    }
  });
}
