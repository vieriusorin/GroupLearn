import { and, eq, sql } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessonCompletions,
  lessons,
} from "@/infrastructure/database/schema/learning-path.schema";
import type { IsUnitCompletedQuery } from "@/queries/paths/IsUnitCompleted.query";

export class IsUnitCompletedHandler
  implements IQueryHandler<IsUnitCompletedQuery, boolean>
{
  async execute(query: IsUnitCompletedQuery): Promise<boolean> {
    const [result] = await db
      .select({
        totalLessons: sql<number>`COUNT(${lessons.id})`,
        completedLessons: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
      })
      .from(lessons)
      .leftJoin(
        lessonCompletions,
        and(
          eq(lessons.id, lessonCompletions.lessonId),
          eq(lessonCompletions.userId, query.userId),
        ),
      )
      .where(eq(lessons.unitId, query.unitId));

    const totalLessons = Number(result.totalLessons) || 0;
    const completedLessons = Number(result.completedLessons) || 0;

    return totalLessons > 0 && totalLessons === completedLessons;
  }
}
