"use server";

import type { PathWithProgress } from "@/application/dtos";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getPathsQuery } from "@/queries/paths/GetPaths.query";

export async function getPaths(
  domainId?: number,
): Promise<ActionResult<PathWithProgress[]>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const query = getPathsQuery(user.id, domainId);
      const result = await queryHandlers.paths.getPaths.execute(query);

      return {
        success: true,
        data: result.paths,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch paths",
        code: "FETCH_ERROR",
      };
    }
  });
}
