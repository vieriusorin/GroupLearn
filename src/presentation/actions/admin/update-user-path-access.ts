"use server";

import { eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import { approvePathAccessCommand } from "@/commands/paths/ApprovePathAccess.command";
import { revokePathAccessCommand } from "@/commands/paths/RevokePathAccess.command";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getPathByIdQuery } from "@/queries/paths/GetPathById.query";

export async function updateUserPathAccess(
  userId: string,
  pathId: number,
  approved: boolean,
): Promise<ActionResult<SuccessResult & { message: string }>> {
  return withAuth(["admin"], async (user) => {
    try {
      const [targetUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!targetUser) {
        return {
          success: false,
          error: "User not found",
          code: "NOT_FOUND",
        };
      }

      const pathQuery = getPathByIdQuery(pathId);
      const pathResult =
        await queryHandlers.paths.getPathById.execute(pathQuery);

      if (!pathResult.path) {
        return {
          success: false,
          error: "Path not found",
          code: "NOT_FOUND",
        };
      }

      if (pathResult.path.visibility !== "private") {
        return {
          success: false,
          error:
            "Only private paths can have approval managed. Public paths are only accessible to admins.",
          code: "VALIDATION_ERROR",
        };
      }

      if (pathResult.path.createdBy === userId) {
        return {
          success: false,
          error: "Cannot modify access for paths created by the user",
          code: "VALIDATION_ERROR",
        };
      }

      if (approved) {
        const command = approvePathAccessCommand(userId, pathId, user.id);
        await commandHandlers.paths.approvePathAccess.execute(command);
      } else {
        const command = revokePathAccessCommand(userId, pathId);
        await commandHandlers.paths.revokePathAccess.execute(command);
      }

      return {
        success: true,
        data: {
          success: true,
          message: approved
            ? "User approved for path"
            : "User approval removed for path",
        } as SuccessResult & { message: string },
      };
    } catch (error) {
      console.error("Error updating user path access:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update user path access",
      };
    }
  });
}
