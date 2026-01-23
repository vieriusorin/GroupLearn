import { and, eq } from "drizzle-orm";
import type { SuccessResult } from "@/application/dtos/groups.dto";
import type { AssignPathCommand } from "@/commands/groups/AssignPath.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import { paths } from "@/infrastructure/database/schema/learning-path.schema";
import { getDb } from "@/lib/infrastructure/db";

export class AssignPathHandler
  implements ICommandHandler<AssignPathCommand, SuccessResult>
{
  async execute(command: AssignPathCommand): Promise<SuccessResult> {
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
        "You do not have permission to assign paths to this group",
        "FORBIDDEN",
      );
    }

    const [path] = await db
      .select({ id: paths.id })
      .from(paths)
      .where(eq(paths.id, command.pathId));

    if (!path) {
      throw new DomainError("Path not found", "NOT_FOUND");
    }

    const [existingAssignment] = await db
      .select({ id: groupPaths.id })
      .from(groupPaths)
      .where(
        and(
          eq(groupPaths.groupId, command.groupId),
          eq(groupPaths.pathId, command.pathId),
        ),
      );

    if (existingAssignment) {
      throw new DomainError(
        "Path is already assigned to this group",
        "PATH_ALREADY_ASSIGNED",
      );
    }

    await db.insert(groupPaths).values({
      groupId: command.groupId,
      pathId: command.pathId,
      assignedBy: command.userId,
      assignedAt: new Date(),
    });

    if (command.isVisible === false) {
      await db.insert(groupPathVisibility).values({
        groupId: command.groupId,
        pathId: command.pathId,
        isVisible: false,
      });
    }

    return {
      success: true,
    };
  }
}
