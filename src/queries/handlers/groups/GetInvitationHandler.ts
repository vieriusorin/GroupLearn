import { count, eq } from "drizzle-orm";
import type { GetInvitationResult } from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { InvitationStatus } from "@/infrastructure/database/schema/enums";
import {
  groupInvitations,
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import type { GetInvitationQuery } from "@/queries/groups/GetInvitation.query";

export class GetInvitationHandler
  implements IQueryHandler<GetInvitationQuery, GetInvitationResult>
{
  async execute(query: GetInvitationQuery): Promise<GetInvitationResult> {
    if (!query.token || query.token.trim().length === 0) {
      throw new DomainError("Token is required", "VALIDATION_ERROR");
    }

    const [invitation] = await db
      .select({
        id: groupInvitations.id,
        groupId: groupInvitations.groupId,
        email: groupInvitations.email,
        role: groupInvitations.role,
        invitedBy: groupInvitations.invitedBy,
        expiresAt: groupInvitations.expiresAt,
        status: groupInvitations.status,
      })
      .from(groupInvitations)
      .where(eq(groupInvitations.token, query.token))
      .limit(1);

    if (!invitation) {
      throw new DomainError("Invitation not found", "NOT_FOUND");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new DomainError(
        "This invitation has already been used",
        "VALIDATION_ERROR",
      );
    }

    const now = new Date();
    if (now > invitation.expiresAt) {
      await db
        .update(groupInvitations)
        .set({ status: InvitationStatus.EXPIRED })
        .where(eq(groupInvitations.id, invitation.id));

      throw new DomainError("This invitation has expired", "VALIDATION_ERROR");
    }

    const [group] = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        adminName: users.name,
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id))
      .where(eq(groups.id, invitation.groupId))
      .limit(1);

    if (!group) {
      throw new DomainError("Group not found", "NOT_FOUND");
    }

    const [memberCountResult] = await db
      .select({ count: count() })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, invitation.groupId));

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
      data: {
        valid: true,
        invitation: {
          id: invitation.id,
          groupId: invitation.groupId,
          email: invitation.email,
          invitedBy: invitation.invitedBy,
          invitedByName: inviterName,
          expiresAt: invitation.expiresAt.toISOString(),
        },
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          adminName: group.adminName || "Unknown",
          memberCount: Number(memberCountResult?.count ?? 0),
        },
      },
    };
  }
}
