"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import { validateInvitationToken } from "@/lib/invitation-token";
import type { ActionResult } from "@/presentation/types/action-result";
import { withOptionalAuth } from "@/presentation/utils/action-wrapper";
import type { InvitationData } from "@/types/invitation";

/**
 * Server Action: Get invitation by token
 *
 * This can be called without authentication (for public invitation pages)
 * but will include more information if the user is authenticated.
 *
 * @param token - The invitation token
 * @returns ActionResult with invitation data or error
 */
export async function getInvitation(
  token: string,
): Promise<ActionResult<InvitationData>> {
  return withOptionalAuth<InvitationData>(async (_user) => {
    // Validate input
    if (!token || token.trim().length === 0) {
      return {
        success: false,
        error: "Token is required",
        code: "VALIDATION_ERROR",
      };
    }

    // Validate the invitation token
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
        data: {
          valid: false,
          error: validation.error,
          message: errorMessage,
        },
      };
    }

    const invitation = validation.invitation!;

    // Get group details
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
        error: "Group not found",
        code: "NOT_FOUND",
        data: {
          valid: false,
          error: "not_found",
          message: "Group not found",
        },
      };
    }

    // Get inviter's name
    const [inviter] = await db
      .select({
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, invitation.invitedBy))
      .limit(1);

    const inviterName = inviter?.name || inviter?.email || "Unknown User";

    return {
      success: true,
      data: {
        valid: true,
        invitation: {
          id: invitation.id,
          groupId: invitation.groupId,
          email: invitation.email,
          invitedBy: invitation.invitedBy,
          invitedByName: inviterName,
          expiresAt: invitation.expiresAt,
        },
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
