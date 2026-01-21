"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import { paths } from "@/infrastructure/database/schema/learning-path.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function assignPath(
  groupId: number,
  pathId: number,
  isVisible: boolean = true,
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
          error: "You do not have permission to assign paths to this group",
        };
      }

      const [path] = await db
        .select({ id: paths.id })
        .from(paths)
        .where(eq(paths.id, pathId));

      if (!path) {
        return {
          success: false,
          error: "Path not found",
        };
      }

      const [existingAssignment] = await db
        .select({ id: groupPaths.id })
        .from(groupPaths)
        .where(
          and(eq(groupPaths.groupId, groupId), eq(groupPaths.pathId, pathId)),
        );

      if (existingAssignment) {
        return {
          success: false,
          error: "Path is already assigned to this group",
        };
      }

      await db.insert(groupPaths).values({
        groupId,
        pathId,
        assignedBy: user.id,
        assignedAt: new Date(),
      });

      if (!isVisible) {
        await db.insert(groupPathVisibility).values({
          groupId,
          pathId,
          isVisible: false,
        });
      }

      revalidatePath(`/admin/groups/${groupId}/paths`);
      revalidatePath(`/groups/${groupId}`);
      revalidateTag(CACHE_TAGS.paths, { expire: 0 });

      return {
        success: true,
        data: undefined,
      };
    } catch (error) {
      console.error("Error assigning path:", error);
      return {
        success: false,
        error: "Failed to assign path",
      };
    }
  });
}
