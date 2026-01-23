"use server";

import type { MemberProgress } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getMemberProgressQuery } from "@/queries/groups/GetMemberProgress.query";

export async function getMemberProgressAction(
  groupId: number,
  userId: string,
): Promise<ActionResult<MemberProgress>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const query = getMemberProgressQuery(user.id, groupId, userId);
      const result =
        await queryHandlers.groups.getMemberProgress.execute(query);

      return {
        success: true,
        data: result.progress,
      };
    } catch (error) {
      console.error("Error fetching member progress:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch member progress",
      };
    }
  });
}
