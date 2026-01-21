"use server";

import { type GroupAnalytics, getGroupAnalytics } from "@/lib/analytics";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getGroupAnalyticsAction(
  groupId: number,
): Promise<ActionResult<GroupAnalytics>> {
  return withAuth(["admin", "member"], async (_user) => {
    try {
      const analytics = await getGroupAnalytics(groupId);

      return {
        success: true,
        data: analytics,
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
