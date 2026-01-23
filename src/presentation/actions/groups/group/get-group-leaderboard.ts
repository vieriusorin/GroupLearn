"use server";

import type { GroupLeaderboardEntry } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getGroupLeaderboardQuery } from "@/queries/groups/GetGroupLeaderboard.query";

export async function getGroupLeaderboardAction(
  groupId: number,
  limit: number = 10,
): Promise<ActionResult<GroupLeaderboardEntry[]>> {
  return withAuth(["admin", "member"], async (_user) => {
    try {
      const query = getGroupLeaderboardQuery(groupId, limit);
      const result =
        await queryHandlers.groups.getGroupLeaderboard.execute(query);

      return {
        success: true,
        data: result.leaderboard,
      };
    } catch (error) {
      console.error("Error fetching group leaderboard:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch group leaderboard",
      };
    }
  });
}
