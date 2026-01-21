"use server";

import { randomBytes } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  GroupRole,
  InvitationStatus,
} from "@/infrastructure/database/schema/enums";
import {
  groupInvitations,
  groupMembers,
  invitationPaths,
} from "@/infrastructure/database/schema/groups.schema";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function sendInvitation(
  groupId: number,
  email: string,
  role: "member" | "admin",
  pathIds: number[] = [],
): Promise<ActionResult<{ invitationId: number; token: string }>> {
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
        error: "You do not have permission to send invitations for this group",
      };
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      const [existingMember] = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, existingUser.id),
          ),
        )
        .limit(1);

      if (existingMember) {
        return {
          success: false,
          error: "User is already a member of this group",
        };
      }
    }

    const [existingInvitation] = await db
      .select({ id: groupInvitations.id })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.groupId, groupId),
          eq(groupInvitations.email, email),
          eq(groupInvitations.status, InvitationStatus.PENDING),
        ),
      )
      .limit(1);

    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email",
      };
    }

    const token = randomBytes(32).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [newInvitation] = await db
      .insert(groupInvitations)
      .values({
        groupId,
        email,
        role: role === "admin" ? GroupRole.ADMIN : GroupRole.MEMBER,
        token,
        expiresAt,
        invitedBy: user.id,
        status: InvitationStatus.PENDING,
      })
      .returning();

    const invitationId = newInvitation.id;

    if (pathIds.length > 0) {
      await db.insert(invitationPaths).values(
        pathIds.map((pathId) => ({
          invitationId,
          pathId,
        })),
      );
    }

    revalidatePath(`/admin/groups/${groupId}`);

    return {
      success: true,
      data: { invitationId, token },
    };
  });
}
