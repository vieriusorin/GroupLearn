"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { groupMembers } from "@/infrastructure/database/schema/groups.schema";
import { getMemberProgress, type MemberProgress } from "@/lib/analytics";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getMemberProgressAction(
  groupId: number,
  userId: string,
): Promise<ActionResult<MemberProgress>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const [membership] = await db
        .select({ role: groupMembers.role })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, user.id),
          ),
        )
        .limit(1);

      const isAdmin = user.role === "admin" || membership?.role === "admin";
      const isViewingSelf = user.id === userId;

      if (!isAdmin && !isViewingSelf) {
        return {
          success: false,
          error: "You do not have permission to view this member's progress",
        };
      }

      const progress = await getMemberProgress(userId, groupId);

      return {
        success: true,
        data: progress,
      };
    } catch (error) {
      console.error("Error fetching member progress:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch member progress",
      };
    }
  });
}
