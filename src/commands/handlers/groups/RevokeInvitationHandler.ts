import { and, eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import type { RevokeInvitationCommand } from "@/commands/groups/RevokeInvitation.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupInvitations,
  groupMembers,
} from "@/infrastructure/database/schema/groups.schema";

export class RevokeInvitationHandler
  implements ICommandHandler<RevokeInvitationCommand, SuccessResult>
{
  async execute(command: RevokeInvitationCommand): Promise<SuccessResult> {
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
        "You do not have permission to revoke invitations for this group",
        "FORBIDDEN",
      );
    }

    const [invitation] = await db
      .select({ id: groupInvitations.id })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.id, command.invitationId),
          eq(groupInvitations.groupId, command.groupId),
        ),
      )
      .limit(1);

    if (!invitation) {
      throw new DomainError("Invitation not found", "NOT_FOUND");
    }

    await db
      .delete(groupInvitations)
      .where(eq(groupInvitations.id, command.invitationId));

    return {
      success: true,
    };
  }
}
