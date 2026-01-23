import { and, eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import type { TogglePathVisibilityCommand } from "@/commands/groups/TogglePathVisibility.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import { getDb } from "@/lib/infrastructure/db";

export class TogglePathVisibilityHandler
  implements ICommandHandler<TogglePathVisibilityCommand, SuccessResult>
{
  async execute(command: TogglePathVisibilityCommand): Promise<SuccessResult> {
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
        "You do not have permission to modify path visibility for this group",
        "FORBIDDEN",
      );
    }

    const [assignment] = await db
      .select({ id: groupPaths.id })
      .from(groupPaths)
      .where(
        and(
          eq(groupPaths.groupId, command.groupId),
          eq(groupPaths.pathId, command.pathId),
        ),
      );

    if (!assignment) {
      throw new DomainError("Path is not assigned to this group", "NOT_FOUND");
    }

    const [visibilityRecord] = await db
      .select({ id: groupPathVisibility.id })
      .from(groupPathVisibility)
      .where(
        and(
          eq(groupPathVisibility.groupId, command.groupId),
          eq(groupPathVisibility.pathId, command.pathId),
        ),
      );

    if (visibilityRecord) {
      await db
        .update(groupPathVisibility)
        .set({ isVisible: command.isVisible })
        .where(
          and(
            eq(groupPathVisibility.groupId, command.groupId),
            eq(groupPathVisibility.pathId, command.pathId),
          ),
        );
    } else {
      await db.insert(groupPathVisibility).values({
        groupId: command.groupId,
        pathId: command.pathId,
        isVisible: command.isVisible,
      });
    }

    return {
      success: true,
    };
  }
}
