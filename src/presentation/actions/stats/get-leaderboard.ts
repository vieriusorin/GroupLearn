"use server";

import { z } from "zod";
import type { LeaderboardData } from "@/application/dtos/stats.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getLeaderboardQuery } from "@/queries/stats/GetLeaderboard.query";

const leaderboardInputSchema = z.object({
  period: z.enum(["all-time", "7days", "30days"]).default("all-time"),
  limit: z.number().int().min(1).max(100).default(10),
});

export type LeaderboardInput = z.infer<typeof leaderboardInputSchema>;

export async function getLeaderboard(
  input?: Partial<LeaderboardInput>,
): Promise<ActionResult<LeaderboardData>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const params = leaderboardInputSchema.parse({
        period: input?.period,
        limit: input?.limit,
      });

      const query = getLeaderboardQuery(user.id, params.period, params.limit);
      const result = await queryHandlers.stats.getLeaderboard.execute(query);

      return {
        success: true,
        data: {
          period: result.data.period,
          leaderboard: result.data.leaderboard,
          userRank: result.data.userRank,
          userXP: result.data.userXP,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch leaderboard",
        code: "FETCH_ERROR",
      };
    }
  });
}
