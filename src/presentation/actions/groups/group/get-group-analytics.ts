"use server";

import type { GroupAnalytics } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getGroupAnalyticsQuery } from "@/queries/groups/GetGroupAnalytics.query";

export async function getGroupAnalyticsAction(
  groupId: number,
): Promise<ActionResult<GroupAnalytics>> {
  return withAuth(["admin", "member"], async (_user) => {
    try {
      const query = getGroupAnalyticsQuery(groupId);
      const result =
        await queryHandlers.groups.getGroupAnalytics.execute(query);

      return {
        success: true,
        data: result.analytics,
      };
    } catch (error) {
      console.error("Error fetching group analytics:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch group analytics",
      };
    }
  });
}
