import { and, eq } from "drizzle-orm";
import type { RevokePathAccessCommand } from "@/commands/paths/RevokePathAccess.command";
import type { ICommandHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { pathApprovals } from "@/infrastructure/database/schema";

export class RevokePathAccessHandler
  implements ICommandHandler<RevokePathAccessCommand, void>
{
  async execute(command: RevokePathAccessCommand): Promise<void> {
    await db
      .delete(pathApprovals)
      .where(
        and(
          eq(pathApprovals.pathId, command.pathId),
          eq(pathApprovals.userId, command.userId),
        ),
      );
  }
}
