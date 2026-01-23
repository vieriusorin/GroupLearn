import { eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import type { DeleteGroupCommand } from "@/commands/groups/DeleteGroup.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { groups } from "@/infrastructure/database/schema/groups.schema";

export class DeleteGroupHandler
  implements ICommandHandler<DeleteGroupCommand, SuccessResult>
{
  async execute(command: DeleteGroupCommand): Promise<SuccessResult> {
    if (!command.groupId || command.groupId <= 0) {
      throw new DomainError("Invalid group ID", "VALIDATION_ERROR");
    }

    const [group] = await db
      .select({
        id: groups.id,
        adminId: groups.adminId,
      })
      .from(groups)
      .where(eq(groups.id, command.groupId))
      .limit(1);

    if (!group) {
      throw new DomainError("Group not found", "NOT_FOUND");
    }

    const [userRecord] = await db
      .select({
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, command.userId))
      .limit(1);

    if (!userRecord) {
      throw new DomainError("User not found", "NOT_FOUND");
    }

    if (userRecord.role !== "admin" && group.adminId !== command.userId) {
      throw new DomainError(
        "You do not have permission to delete this group",
        "FORBIDDEN",
      );
    }

    await db.delete(groups).where(eq(groups.id, command.groupId));

    return {
      success: true,
    };
  }
}
