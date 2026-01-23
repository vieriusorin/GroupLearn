"use server";

import { revalidateTag } from "next/cache";
import type { RefillHeartsResult } from "@/application/dtos/gamification.dto";
import { refillHeartsCommand } from "@/commands/progress/RefillHearts.command";
import { commandHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function refillHearts(
  pathId: number,
): Promise<ActionResult<RefillHeartsResult>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!pathId || pathId <= 0) {
      return {
        success: false,
        error: "Invalid path ID",
        code: "VALIDATION_ERROR",
      };
    }

    const command = refillHeartsCommand(user.id, pathId);
    const result = await commandHandlers.progress.refillHearts.execute(command);

    revalidateTag("user-progress", { expire: 0 });
    revalidateTag("user-stats", { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
