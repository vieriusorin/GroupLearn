import { and, eq, sql } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";
import type { IsLessonCompletedQuery } from "@/queries/paths/IsLessonCompleted.query";

export class IsLessonCompletedHandler
  implements IQueryHandler<IsLessonCompletedQuery, boolean>
{
  async execute(query: IsLessonCompletedQuery): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.lessonId, query.lessonId),
          eq(lessonCompletions.userId, query.userId),
        ),
      );

    return Number(result.count) > 0;
  }
}
