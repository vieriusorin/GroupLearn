"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function togglePathVisibility(
  groupId: number,
  pathId: number,
  isVisible: boolean,
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
          error:
            "You do not have permission to modify path visibility for this group",
        };
      }

      const [assignment] = await db
        .select({ id: groupPaths.id })
        .from(groupPaths)
        .where(
          and(eq(groupPaths.groupId, groupId), eq(groupPaths.pathId, pathId)),
        );

      if (!assignment) {
        return {
          success: false,
          error: "Path is not assigned to this group",
        };
      }

      const [visibilityRecord] = await db
        .select({ id: groupPathVisibility.id })
        .from(groupPathVisibility)
        .where(
          and(
            eq(groupPathVisibility.groupId, groupId),
            eq(groupPathVisibility.pathId, pathId),
          ),
        );

      if (visibilityRecord) {
        await db
          .update(groupPathVisibility)
          .set({ isVisible })
          .where(
            and(
              eq(groupPathVisibility.groupId, groupId),
              eq(groupPathVisibility.pathId, pathId),
            ),
          );
      } else {
        await db.insert(groupPathVisibility).values({
          groupId,
          pathId,
          isVisible,
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
      console.error("Error toggling path visibility:", error);
      return {
        success: false,
        error: "Failed to toggle path visibility",
      };
    }
  });
}
