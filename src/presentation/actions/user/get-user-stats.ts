"use server";

import type { UserStats } from "@/application/dtos/stats.dto";
import { checkAndResetStreaksCommand } from "@/commands/progress/CheckAndResetStreaks.command";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getUserStatsQuery } from "@/queries/stats/GetUserStats.query";

/**
 * Server Action: Get user statistics
 *
 * @returns ActionResult with user stats or error
 */
export async function getUserStats(): Promise<ActionResult<UserStats>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      // Check and reset streaks lazily (no cron job needed)
      const command = checkAndResetStreaksCommand(user.id);
      await commandHandlers.progress.checkAndResetStreaks.execute(command);

      const query = getUserStatsQuery(user.id);
      const result = await queryHandlers.stats.getUserStats.execute(query);

      return {
        success: true,
        data: result.stats,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch user stats",
        code: "FETCH_ERROR",
      };
    }
  });
}
