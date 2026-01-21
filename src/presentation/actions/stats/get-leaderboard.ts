"use server";

import { z } from "zod";
import {
  getCachedTopUsersAllTime,
  getCachedTopUsersLast7Days,
  getCachedTopUsersLast30Days,
  getUserRankWithContext,
  type LeaderboardEntry,
} from "@/lib/leaderboard-utils";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

const leaderboardInputSchema = z.object({
  period: z.enum(["all-time", "7days", "30days"]).default("all-time"),
  limit: z.number().int().min(1).max(100).default(10),
});

export type LeaderboardInput = z.infer<typeof leaderboardInputSchema>;

interface LeaderboardData {
  period: LeaderboardInput["period"];
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  userXP: number;
}

/**
 * Server Action: Get global XP leaderboard
 *
 * Mirrors the legacy `/api/leaderboard` route but exposes it as a typed server action.
 */
export async function getLeaderboard(
  input?: Partial<LeaderboardInput>,
): Promise<ActionResult<LeaderboardData>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const params = leaderboardInputSchema.parse({
        period: input?.period,
        limit: input?.limit,
      });

      let leaderboard: LeaderboardEntry[];
      switch (params.period) {
        case "7days":
          leaderboard = await getCachedTopUsersLast7Days(params.limit);
          break;
        case "30days":
          leaderboard = await getCachedTopUsersLast30Days(params.limit);
          break;
        default:
          leaderboard = await getCachedTopUsersAllTime(params.limit);
          break;
      }

      const userContext = await getUserRankWithContext(user.id, null, null, 2);

      return {
        success: true,
        data: {
          period: params.period,
          leaderboard,
          userRank: userContext.userRank,
          userXP: userContext.userXP,
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
