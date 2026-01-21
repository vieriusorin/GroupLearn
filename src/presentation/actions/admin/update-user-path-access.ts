"use server";

import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema";
import {
  approveUserForPath,
  getPathById,
  removePathApproval,
} from "@/lib/db-operations-paths-critical-converted";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateUserPathAccess(
  userId: string,
  pathId: number,
  approved: boolean,
): Promise<ActionResult<{ success: boolean; message: string }>> {
  return withAuth(["admin"], async (user) => {
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

    const path = await getPathById(pathId);
    if (!path) {
      return {
        success: false,
        error: "Path not found",
        code: "NOT_FOUND",
      };
    }

    if (path.visibility !== "private") {
      return {
        success: false,
        error:
          "Only private paths can have approval managed. Public paths are only accessible to admins.",
        code: "VALIDATION_ERROR",
      };
    }

    if (path.created_by === userId) {
      return {
        success: false,
        error: "Cannot modify access for paths created by the user",
        code: "VALIDATION_ERROR",
      };
    }

    if (approved) {
      await approveUserForPath(pathId, userId, user.id);
    } else {
      await removePathApproval(pathId, userId);
    }

    return {
      success: true,
      data: {
        success: true,
        message: approved
          ? "User approved for path"
          : "User approval removed for path",
      },
    };
  });
}
