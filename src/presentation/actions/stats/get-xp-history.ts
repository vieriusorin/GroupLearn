"use server";

import { z } from "zod";
import {
  getCachedTotalXP,
  getCachedXPHistory,
} from "@/lib/db-operations-paths-critical-converted";
import type { XPTransaction } from "@/lib/types";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

const xpHistoryInputSchema = z.object({
  pathId: z.number().int().positive("Path ID must be a positive integer"),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(50),
});

export type XpHistoryInput = z.infer<typeof xpHistoryInputSchema>;

interface XpHistoryData {
  transactions: XPTransaction[];
  total_xp: number;
  daily_xp: number;
  weekly_xp: number;
}

/**
 * Server Action: Get XP transaction history for a path
 *
 * Mirrors the legacy `/api/xp-history` route but exposes it as a typed server action.
 */
export async function getXpHistory(
  input: XpHistoryInput,
): Promise<ActionResult<XpHistoryData>> {
  return withAuth(["admin", "member"], async () => {
    try {
      const params = xpHistoryInputSchema.parse(input);

      const transactions = await getCachedXPHistory(
        params.pathId,
        params.limit,
      );
      const totalXP = await getCachedTotalXP(params.pathId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const dailyXP = transactions
        .filter((t) => t.created_at >= todayISO)
        .reduce((sum, t) => sum + t.amount, 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const weekAgoISO = weekAgo.toISOString();

      const weeklyXP = transactions
        .filter((t) => t.created_at >= weekAgoISO)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        success: true,
        data: {
          transactions,
          total_xp: totalXP,
          daily_xp: dailyXP,
          weekly_xp: weeklyXP,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch XP history",
        code: "FETCH_ERROR",
      };
    }
  });
}
