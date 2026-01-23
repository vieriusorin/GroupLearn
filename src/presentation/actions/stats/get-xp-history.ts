"use server";

import { z } from "zod";
import type { XpHistoryData } from "@/application/dtos/stats.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getXPHistoryQuery } from "@/queries/stats/GetXPHistory.query";

const xpHistoryInputSchema = z.object({
  pathId: z.number().int().positive("Path ID must be a positive integer"),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(50),
});

export type XpHistoryInput = z.infer<typeof xpHistoryInputSchema>;

export async function getXpHistory(
  input: XpHistoryInput,
): Promise<ActionResult<XpHistoryData>> {
  return withAuth(["admin", "member"], async () => {
    try {
      const params = xpHistoryInputSchema.parse(input);

      const query = getXPHistoryQuery(params.pathId, params.limit);
      const result = await queryHandlers.stats.getXPHistory.execute(query);

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch XP history",
        code: "FETCH_ERROR",
      };
    }
  });
}
