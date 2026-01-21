"use server";

import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { groups } from "@/infrastructure/database/schema/groups.schema";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteGroup(
  groupId: number,
): Promise<ActionResult<{ success: boolean }>> {
  return withAuth(["admin", "member"], async (user) => {
    // Validate input
    if (!groupId || groupId <= 0) {
      return {
        success: false,
        error: "Invalid group ID",
        code: "VALIDATION_ERROR",
      };
    }

    const [group] = await db
      .select({
        id: groups.id,
        adminId: groups.adminId,
      })
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return {
        success: false,
        error: "Group not found",
        code: "NOT_FOUND",
      };
    }

    const [userRecord] = await db
      .select({
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userRecord) {
      return {
        success: false,
        error: "User not found",
        code: "NOT_FOUND",
      };
    }

    if (userRecord.role !== "admin" && group.adminId !== user.id) {
      return {
        success: false,
        error: "You do not have permission to delete this group",
        code: "FORBIDDEN",
      };
    }

    await db.delete(groups).where(eq(groups.id, groupId));

    return {
      success: true,
      data: { success: true },
    };
  });
}
