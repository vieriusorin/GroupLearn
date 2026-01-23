import { eq, sql } from "drizzle-orm";
import type { AddToStrugglingQueueCommand } from "@/commands/review/AddToStrugglingQueue.command";
import type { ICommandHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { strugglingQueue as strugglingQueueTable } from "@/infrastructure/database/schema";

export class AddToStrugglingQueueHandler
  implements ICommandHandler<AddToStrugglingQueueCommand, void>
{
  async execute(command: AddToStrugglingQueueCommand): Promise<void> {
    const [existing] = await db
      .select()
      .from(strugglingQueueTable)
      .where(eq(strugglingQueueTable.flashcardId, command.flashcardId))
      .limit(1);

    if (existing) {
      await db
        .update(strugglingQueueTable)
        .set({
          timesFailed: sql`${strugglingQueueTable.timesFailed} + 1`,
          lastFailedAt: new Date(),
        })
        .where(eq(strugglingQueueTable.flashcardId, command.flashcardId));
    } else {
      await db.insert(strugglingQueueTable).values({
        flashcardId: command.flashcardId,
        // addedAt, timesFailed, lastFailedAt have defaults
      });
    }
  }
}
