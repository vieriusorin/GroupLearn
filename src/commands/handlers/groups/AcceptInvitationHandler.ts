import { and, eq, sql } from "drizzle-orm";
import type { AcceptInvitationResult } from "@/application/dtos/groups.dto";
import type { AcceptInvitationCommand } from "@/commands/groups/AcceptInvitation.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
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

export class AcceptInvitationHandler
  implements ICommandHandler<AcceptInvitationCommand, AcceptInvitationResult>
{
  async execute(
    command: AcceptInvitationCommand,
  ): Promise<AcceptInvitationResult> {
    if (!command.token || command.token.trim().length === 0) {
      throw new DomainError("Token is required", "VALIDATION_ERROR");
    }

    const [invitationRow] = await db
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
      .where(eq(groupInvitations.token, command.token))
      .limit(1);

    if (!invitationRow) {
      throw new DomainError("Invitation not found", "NOT_FOUND");
    }

    if (invitationRow.status !== InvitationStatus.PENDING) {
      throw new DomainError(
        "This invitation has already been used",
        "VALIDATION_ERROR",
      );
    }

    const now = new Date();
    if (now > invitationRow.expiresAt) {
      await db
        .update(groupInvitations)
        .set({ status: InvitationStatus.EXPIRED })
        .where(eq(groupInvitations.id, invitationRow.id));

      throw new DomainError("This invitation has expired", "VALIDATION_ERROR");
    }

    const invitation = {
      id: invitationRow.id,
      groupId: invitationRow.groupId,
      email: invitationRow.email,
      role: invitationRow.role as "member" | "admin",
      invitedBy: invitationRow.invitedBy,
      expiresAt: invitationRow.expiresAt.toISOString(),
    };

    const [userRecord] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, command.userId))
      .limit(1);

    if (!userRecord) {
      throw new DomainError("User not found", "NOT_FOUND");
    }

    if (userRecord.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new DomainError(
        "This invitation was sent to a different email address",
        "FORBIDDEN",
      );
    }

    const [existingMember] = await db
      .select({ id: groupMembers.id })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, invitation.groupId),
          eq(groupMembers.userId, command.userId),
        ),
      )
      .limit(1);

    if (existingMember) {
      throw new DomainError(
        "You are already a member of this group",
        "VALIDATION_ERROR",
      );
    }

    const invitationPathsList = await db
      .select({ pathId: invitationPaths.pathId })
      .from(invitationPaths)
      .where(eq(invitationPaths.invitationId, invitation.id));

    await db.transaction(async (tx) => {
      await tx.insert(groupMembers).values({
        groupId: invitation.groupId,
        userId: command.userId,
        role: GroupRole.MEMBER,
        invitedBy: invitation.invitedBy,
      });

      await tx
        .update(groupInvitations)
        .set({
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        })
        .where(eq(groupInvitations.id, invitation.id));

      if (invitationPathsList.length > 0) {
        for (const { pathId } of invitationPathsList) {
          await tx
            .insert(groupPaths)
            .values({
              groupId: invitation.groupId,
              pathId: pathId,
              assignedBy: invitation.invitedBy,
            })
            .onConflictDoNothing();

          await tx
            .insert(userProgress)
            .values({
              userId: command.userId,
              pathId: pathId,
              groupId: invitation.groupId,
              totalXp: 0,
              hearts: 5,
              streakCount: 0,
            })
            .onConflictDoNothing();
        }
      }
    });

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
      throw new DomainError(
        "Group not found after accepting invitation",
        "NOT_FOUND",
      );
    }

    const [memberCountResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, invitation.groupId));

    return {
      success: true,
      message: "Successfully joined the group!",
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        adminName: group.adminName || "Unknown",
        memberCount: Number(memberCountResult?.count ?? 1),
      },
    };
  }
}
