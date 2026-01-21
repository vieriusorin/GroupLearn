"use server";

import { getGroupLeaderboard, type LeaderboardEntry } from "@/lib/analytics";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getGroupLeaderboardAction(
  groupId: number,
  limit: number = 10,
): Promise<ActionResult<LeaderboardEntry[]>> {
  return withAuth(["admin", "member"], async (_user) => {
    try {
      const leaderboard = await getGroupLeaderboard(groupId, limit);

      return {
        success: true,
        data: leaderboard,
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
