"use server";

import { AdminStatsRepository } from "@/lib/repositories/admin-stats.repository";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import type { AdminDashboardData } from "@/types/admin";

export async function getAdminStats(): Promise<
  ActionResult<AdminDashboardData>
> {
  return withAuth(["admin"], async (_user) => {
    try {
      const dashboardData = await AdminStatsRepository.getDashboardData();

      return {
        success: true,
        data: dashboardData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch admin stats",
        code: "INTERNAL_ERROR",
      };
    }
  });
}
