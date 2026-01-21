"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/drizzle";
import {
  groupInvitations,
  groupMembers,
} from "@/infrastructure/database/schema/groups.schema";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function revokeInvitation(
  groupId: number,
  invitationId: number,
): Promise<ActionResult<void>> {
  return withAuth(["admin", "member"], async (user) => {
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

    if (user.role !== "admin" && membership?.role !== "admin") {
      return {
        success: false,
        error:
          "You do not have permission to revoke invitations for this group",
      };
    }

    const [invitation] = await db
      .select({ id: groupInvitations.id })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, invitationId),
          eq(groupInvitations.groupId, groupId),
        ),
      )
      .limit(1);

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    await db
      .delete(groupInvitations)
      .where(eq(groupInvitations.id, invitationId));

    revalidatePath(`/admin/groups/${groupId}`);

    return {
      success: true,
      data: undefined,
    };
  });
}
