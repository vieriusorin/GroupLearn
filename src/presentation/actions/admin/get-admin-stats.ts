"use server";

import type { GetAdminStatsResult } from "@/application/dtos/admin.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getAdminStatsQuery } from "@/queries/admin/GetAdminStats.query";

export async function getAdminStats(): Promise<
  ActionResult<GetAdminStatsResult>
> {
  return withAuth(["admin"], async (_user) => {
    try {
      const query = getAdminStatsQuery();
      const result = await queryHandlers.admin.getAdminStats.execute(query);

      return {
        success: true,
        data: result,
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
