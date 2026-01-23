import { eq } from "drizzle-orm";
import type { ApprovePathAccessCommand } from "@/commands/paths/ApprovePathAccess.command";
import type { ICommandHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import type { PathApproval } from "@/infrastructure/database/schema";
import { pathApprovals, paths } from "@/infrastructure/database/schema";

export type ApprovePathAccessResult = {
  approval: PathApproval;
};

export class ApprovePathAccessHandler
  implements ICommandHandler<ApprovePathAccessCommand, ApprovePathAccessResult>
{
  async execute(
    command: ApprovePathAccessCommand,
  ): Promise<ApprovePathAccessResult> {
    const [path] = await db
      .select({ visibility: paths.visibility })
      .from(paths)
      .where(eq(paths.id, command.pathId))
      .limit(1);

    if (!path) {
      throw new DomainError("Path not found", "NOT_FOUND");
    }

    if (path.visibility !== "private") {
      throw new DomainError(
        "Only private paths require approval",
        "VALIDATION_ERROR",
      );
    }

    const [approval] = await db
      .insert(pathApprovals)
      .values({
        pathId: command.pathId,
        userId: command.userId,
        approvedBy: command.approvedBy,
        approvedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [pathApprovals.pathId, pathApprovals.userId],
        set: {
          approvedBy: command.approvedBy,
          approvedAt: new Date(),
        },
      })
      .returning();

    return {
      approval,
    };
  }
}
