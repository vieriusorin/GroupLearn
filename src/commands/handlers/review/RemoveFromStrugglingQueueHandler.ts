import { eq } from "drizzle-orm";
import type { RemoveFromStrugglingQueueCommand } from "@/commands/review/RemoveFromStrugglingQueue.command";
import type { ICommandHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { strugglingQueue as strugglingQueueTable } from "@/infrastructure/database/schema";

export class RemoveFromStrugglingQueueHandler
  implements ICommandHandler<RemoveFromStrugglingQueueCommand, void>
{
  async execute(command: RemoveFromStrugglingQueueCommand): Promise<void> {
    await db
      .delete(strugglingQueueTable)
      .where(eq(strugglingQueueTable.flashcardId, command.flashcardId));
  }
}
