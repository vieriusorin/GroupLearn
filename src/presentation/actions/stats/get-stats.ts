"use server";

import { unstable_cache } from "next/cache";
import type { DashboardStats } from "@/application/dtos";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getStatsQuery } from "@/queries/stats/GetStats.query";

function getCachedStats(userId: string): Promise<DashboardStats> {
  return unstable_cache(
    async () => {
      const query = getStatsQuery(userId);
      const result = await queryHandlers.stats.getStats.execute(query);
      return result.stats;
    },
    ["dashboard-stats", userId],
    {
      tags: ["dashboard-stats"],
    },
  )();
}

export async function getStats(): Promise<ActionResult<DashboardStats>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const stats = await getCachedStats(user.id);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
        code: "FETCH_ERROR",
      };
    }
  });
}
