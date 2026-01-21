"use server";

import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { groupMembers } from "@/infrastructure/database/schema/groups.schema";
import { getDb } from "@/lib/db";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function removeMember(
  groupId: number,
  userId: number,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
    const db = getDb();

    try {
      const [membership] = await db
        .select({ role: groupMembers.role })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, user.id),
          ),
        );

      if (user.role !== "admin" && membership?.role !== "admin") {
        return {
          success: false,
          error: "You do not have permission to remove members from this group",
        };
      }

      if (Number(user.id) === userId) {
        const [adminCount] = await db
          .select({ count: count() })
          .from(groupMembers)
          .where(
            and(
              eq(groupMembers.groupId, groupId),
              eq(groupMembers.role, "admin"),
            ),
          );

        if (Number(adminCount?.count ?? 0) <= 1) {
          return {
            success: false,
            error: "Cannot remove the last admin from the group",
          };
        }
      }

      await db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, String(userId)),
          ),
        );

      revalidatePath(`/admin/groups/${groupId}`);
      revalidatePath("/groups");

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error removing member:", error);
      return {
        success: false,
        error: "Failed to remove member",
      };
    }
  });
}
