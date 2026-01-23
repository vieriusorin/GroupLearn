import { and, eq } from "drizzle-orm";
import type { SendInvitationResult } from "@/application/dtos/groups.dto";
import type { SendInvitationCommand } from "@/commands/groups/SendInvitation.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
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
import { generateTokenHex } from "@/lib/shared/token-utils";

export class SendInvitationHandler
  implements ICommandHandler<SendInvitationCommand, SendInvitationResult>
{
  async execute(command: SendInvitationCommand): Promise<SendInvitationResult> {
    const [membership] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, command.groupId),
          eq(groupMembers.userId, command.userId),
        ),
      )
      .limit(1);

    const [userRecord] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, command.userId))
      .limit(1);

    if (
      !userRecord ||
      (userRecord.role !== "admin" && membership?.role !== "admin")
    ) {
      throw new DomainError(
        "You do not have permission to send invitations for this group",
        "FORBIDDEN",
      );
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, command.email))
      .limit(1);

    if (existingUser) {
      const [existingMember] = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, command.groupId),
            eq(groupMembers.userId, existingUser.id),
          ),
        )
        .limit(1);

      if (existingMember) {
        throw new DomainError(
          "User is already a member of this group",
          "USER_ALREADY_MEMBER",
        );
      }
    }

    const [existingInvitation] = await db
      .select({ id: groupInvitations.id })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.groupId, command.groupId),
          eq(groupInvitations.email, command.email),
          eq(groupInvitations.status, InvitationStatus.PENDING),
        ),
      )
      .limit(1);

    if (existingInvitation) {
      throw new DomainError(
        "An invitation has already been sent to this email",
        "INVITATION_ALREADY_EXISTS",
      );
    }

    const token = generateTokenHex();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [newInvitation] = await db
      .insert(groupInvitations)
      .values({
        groupId: command.groupId,
        email: command.email,
        role: command.role === "admin" ? GroupRole.ADMIN : GroupRole.MEMBER,
        token,
        expiresAt,
        invitedBy: command.userId,
        status: InvitationStatus.PENDING,
      })
      .returning();

    const invitationId = newInvitation.id;

    if (command.pathIds && command.pathIds.length > 0) {
      await db.insert(invitationPaths).values(
        command.pathIds.map((pathId) => ({
          invitationId,
          pathId,
        })),
      );
    }

    return {
      invitationId,
      token,
    };
  }
}
