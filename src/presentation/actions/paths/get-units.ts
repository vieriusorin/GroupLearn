"use server";

import { canAccessPath } from "@/lib/authorization";
import { getCachedUnitsWithProgress } from "@/lib/db-operations-paths-critical-converted";
import type { UnitWithProgress } from "@/lib/types";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getUnits(
  pathId: number,
): Promise<ActionResult<UnitWithProgress[]>> {
  return withAuth(["admin", "member"], async (user) => {
    // Validate input
    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    const canAccess = await canAccessPath(pathId);
    if (!canAccess) {
      return {
        success: false,
        error: "Forbidden: You do not have access to this path",
        code: "FORBIDDEN",
      };
    }

    try {
      const units = await getCachedUnitsWithProgress(pathId, user.id);
      return {
        success: true,
        data: units,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch units",
        code: "FETCH_ERROR",
      };
    }
  });
}
