"use server";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  GroupRole,
  InvitationStatus,
} from "@/infrastructure/database/schema/enums";
import { userProgress } from "@/infrastructure/database/schema/gamification.schema";
import {
  groupInvitations,
  groupMembers,
  groupPaths,
  groups,
  invitationPaths,
} from "@/infrastructure/database/schema/groups.schema";
import {
  acceptInvitation,
  validateInvitationToken,
} from "@/lib/invitation-token";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  group: {
    id: number;
    name: string;
    description: string | null;
    admin_name: string;
    member_count: number;
  };
}

/**
 * Server Action: Accept an invitation
 *
 * Accepts an invitation and joins the user to the group.
 * Also assigns any paths associated with the invitation to the group.
 *
 * @param token - The invitation token
 * @returns ActionResult with success message and group data or error
 */
export async function acceptInvitationAction(
  token: string,
): Promise<ActionResult<AcceptInvitationResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    // Validate input
    if (!token || token.trim().length === 0) {
      return {
        success: false,
        error: "Token is required",
        code: "VALIDATION_ERROR",
      };
    }

    // Validate the invitation
    const validation = await validateInvitationToken(token);

    if (!validation.valid) {
      const errorMessage =
        validation.error === "not_found"
          ? "Invitation not found"
          : validation.error === "expired"
            ? "This invitation has expired"
            : "This invitation has already been used";

      return {
        success: false,
        error: errorMessage,
        code:
          validation.error === "not_found" ? "NOT_FOUND" : "VALIDATION_ERROR",
      };
    }

    const invitation = validation.invitation!;

    // Check if user's email matches invitation email
    const [userRecord] = await db
      .select({ email: users.email })
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

    if (userRecord.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return {
        success: false,
        error: "This invitation was sent to a different email address",
        code: "FORBIDDEN",
      };
    }

    // Check if already a member
    const [existingMember] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, invitation.groupId),
          eq(groupMembers.userId, user.id),
        ),
      )
      .limit(1);

    if (existingMember) {
      // Mark invitation as accepted anyway
      await acceptInvitation(invitation.id, user.id);

      return {
        success: false,
        error: "You are already a member of this group",
        code: "VALIDATION_ERROR",
      };
    }

    // Get paths associated with this invitation
    const invitationPathsList = await db
      .select({ path_id: invitationPaths.pathId })
      .from(invitationPaths)
      .where(eq(invitationPaths.invitationId, invitation.id));

    // Use a transaction to ensure all operations succeed together
    await db.transaction(async (tx) => {
      // Add user to the group
      await tx.insert(groupMembers).values({
        groupId: invitation.groupId,
        userId: user.id,
        role: GroupRole.MEMBER,
        invitedBy: invitation.invitedBy,
      });

      // Mark invitation as accepted
      await tx
        .update(groupInvitations)
        .set({
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        })
        .where(eq(groupInvitations.id, invitation.id));

      // Assign paths to the group if they were specified in the invitation
      if (invitationPathsList.length > 0) {
        // Insert paths (using ON CONFLICT DO NOTHING equivalent)
        for (const { path_id } of invitationPathsList) {
          await tx
            .insert(groupPaths)
            .values({
              groupId: invitation.groupId,
              pathId: path_id,
              assignedBy: invitation.invitedBy,
            })
            .onConflictDoNothing();

          // Initialize user progress for each assigned path
          await tx
            .insert(userProgress)
            .values({
              userId: user.id,
              pathId: path_id,
              groupId: invitation.groupId,
              totalXp: 0,
              hearts: 5,
              streakCount: 0,
            })
            .onConflictDoNothing();
        }
      }
    });

    // Get updated group info
    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        admin_name: users.name,
        member_count: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${groupMembers}
          WHERE ${groupMembers.groupId} = ${groups.id}
        )`.as("member_count"),
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id))
      .where(eq(groups.id, invitation.groupId))
      .limit(1);

    if (!group) {
      return {
        success: false,
        error: "Group not found after accepting invitation",
        code: "NOT_FOUND",
      };
    }

    return {
      success: true,
      data: {
        success: true,
        message: "Successfully joined the group!",
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          admin_name: group.admin_name || "Unknown",
          member_count: group.member_count,
        },
      },
    };
  });
}
