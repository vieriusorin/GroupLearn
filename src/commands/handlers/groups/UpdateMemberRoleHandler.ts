import { and, count, eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import type { UpdateMemberRoleCommand } from "@/commands/groups/UpdateMemberRole.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { groupMembers } from "@/infrastructure/database/schema/groups.schema";
import { getDb } from "@/lib/infrastructure/db";

export class UpdateMemberRoleHandler
  implements ICommandHandler<UpdateMemberRoleCommand, SuccessResult>
{
  async execute(command: UpdateMemberRoleCommand): Promise<SuccessResult> {
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
        "You do not have permission to update member roles in this group",
        "FORBIDDEN",
      );
    }

    if (
      Number(command.userId) === command.targetUserId &&
      command.role === "member"
    ) {
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
          "Cannot remove admin role from the last admin in the group",
          "CANNOT_REMOVE_LAST_ADMIN",
        );
      }
    }

    await db
      .update(groupMembers)
      .set({ role: command.role })
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
