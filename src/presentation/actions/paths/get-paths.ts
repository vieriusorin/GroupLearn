"use server";

import {
  getCachedVisiblePathsByDomainWithProgress,
  getCachedVisiblePathsWithProgress,
} from "@/lib/db-operations-paths-drizzle";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getPaths(
  domainId?: number,
): Promise<ActionResult<import("@/lib/types").PathWithProgress[]>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      let paths;

      if (domainId) {
        paths = await getCachedVisiblePathsByDomainWithProgress(
          domainId,
          user.id,
        );
      } else {
        paths = await getCachedVisiblePathsWithProgress(user.id);
      }

      return {
        success: true,
        data: paths,
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
