import { eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { strugglingQueue as strugglingQueueTable } from "@/infrastructure/database/schema";
import type { IsCardStrugglingQuery } from "@/queries/review/IsCardStruggling.query";

export class IsCardStrugglingHandler
  implements IQueryHandler<IsCardStrugglingQuery, boolean>
{
  async execute(query: IsCardStrugglingQuery): Promise<boolean> {
    const [row] = await db
      .select({ id: strugglingQueueTable.id })
      .from(strugglingQueueTable)
      .where(eq(strugglingQueueTable.flashcardId, query.flashcardId))
      .limit(1);

    return !!row;
  }
}
