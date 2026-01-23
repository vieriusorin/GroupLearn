"use server";

import type { UnitWithProgress } from "@/application/dtos";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getUnitsQuery } from "@/queries/paths/GetUnits.query";

export async function getUnits(
  pathId: number,
): Promise<ActionResult<UnitWithProgress[]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    try {
      const query = getUnitsQuery(user.id, pathId);
      const result = await queryHandlers.paths.getUnits.execute(query);

      return {
        success: true,
        data: result.units,
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
