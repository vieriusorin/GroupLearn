"use server";

import type { GroupPathListItem } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getAssignedPathsQuery } from "@/queries/groups/GetAssignedPaths.query";

export type { GroupPathListItem as GroupPath } from "@/application/dtos/groups.dto";

export async function getAssignedPaths(
  groupId: number,
): Promise<ActionResult<GroupPathListItem[]>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const query = getAssignedPathsQuery(user.id, groupId);
      const result = await queryHandlers.groups.getAssignedPaths.execute(query);

      return {
        success: true,
        data: result.paths,
      };
    } catch (error) {
      console.error("Error fetching assigned paths:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch assigned paths",
      };
    }
  });
}
