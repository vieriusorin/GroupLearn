import { and, asc, eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { Lesson } from "@/infrastructure/database/schema";
import {
  lessons,
  units,
} from "@/infrastructure/database/schema/learning-path.schema";
import type { GetNextLessonAfterCompletionQuery } from "@/queries/paths/GetNextLessonAfterCompletion.query";

export class GetNextLessonAfterCompletionHandler
  implements IQueryHandler<GetNextLessonAfterCompletionQuery, Lesson | null>
{
  async execute(
    query: GetNextLessonAfterCompletionQuery,
  ): Promise<Lesson | null> {
    const [completedLesson] = await db
      .select({
        id: lessons.id,
        unitId: lessons.unitId,
        orderIndex: lessons.orderIndex,
        pathId: units.pathId,
        unitNumber: units.unitNumber,
      })
      .from(lessons)
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(eq(lessons.id, query.completedLessonId))
      .limit(1);

    if (!completedLesson) return null;

    const [nextInUnit] = await db
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.unitId, completedLesson.unitId),
          eq(lessons.orderIndex, completedLesson.orderIndex + 1),
        ),
      )
      .limit(1);

    if (nextInUnit) {
      return {
        id: nextInUnit.id,
        unitId: nextInUnit.unitId,
        name: nextInUnit.name,
        description: nextInUnit.description,
        orderIndex: nextInUnit.orderIndex,
        xpReward: nextInUnit.xpReward,
        flashcardCount: nextInUnit.flashcardCount,
        createdAt: nextInUnit.createdAt,
      };
    }

    const [nextUnit] = await db
      .select({ id: units.id })
      .from(units)
      .where(
        and(
          eq(units.pathId, completedLesson.pathId),
          eq(units.unitNumber, completedLesson.unitNumber + 1),
        ),
      )
      .limit(1);

    if (nextUnit) {
      const [firstLessonNextUnit] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.unitId, nextUnit.id))
        .orderBy(asc(lessons.orderIndex))
        .limit(1);

      if (firstLessonNextUnit) {
        return {
          id: firstLessonNextUnit.id,
          unitId: firstLessonNextUnit.unitId,
          name: firstLessonNextUnit.name,
          description: firstLessonNextUnit.description,
          orderIndex: firstLessonNextUnit.orderIndex,
          xpReward: firstLessonNextUnit.xpReward,
          flashcardCount: firstLessonNextUnit.flashcardCount,
          createdAt: firstLessonNextUnit.createdAt,
        };
      }
    }

    return null; // Path completed
  }
}
