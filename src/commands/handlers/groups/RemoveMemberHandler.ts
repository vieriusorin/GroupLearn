import { and, count, eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import type { RemoveMemberCommand } from "@/commands/groups/RemoveMember.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { groupMembers } from "@/infrastructure/database/schema/groups.schema";
import { getDb } from "@/lib/infrastructure/db";

export class RemoveMemberHandler
  implements ICommandHandler<RemoveMemberCommand, SuccessResult>
{
  async execute(command: RemoveMemberCommand): Promise<SuccessResult> {
    const db = getDb();

    const [membership] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, command.groupId),
          eq(groupMembers.userId, command.userId),
        ),
      );

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
        "You do not have permission to remove members from this group",
        "FORBIDDEN",
      );
    }

    if (Number(command.userId) === command.targetUserId) {
      const [adminCount] = await db
        .select({ count: count() })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, command.groupId),
            eq(groupMembers.role, "admin"),
          ),
        );

      if (Number(adminCount?.count ?? 0) <= 1) {
        throw new DomainError(
          "Cannot remove the last admin from the group",
          "CANNOT_REMOVE_LAST_ADMIN",
        );
      }
    }

    await db
      .delete(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, command.groupId),
          eq(groupMembers.userId, String(command.targetUserId)),
        ),
      );

    return {
      success: true,
    };
  }
}
