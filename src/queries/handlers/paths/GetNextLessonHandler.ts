import { asc, eq } from "drizzle-orm";
import type {
  IQueryHandler,
  IQueryHandler as IQueryHandlerType,
} from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { Lesson } from "@/infrastructure/database/schema";
import {
  lessons,
  units,
} from "@/infrastructure/database/schema/learning-path.schema";
import type { GetNextLessonQuery } from "@/queries/paths/GetNextLesson.query";
import { isLessonCompletedQuery } from "@/queries/paths/IsLessonCompleted.query";
import { isLessonUnlockedQuery } from "@/queries/paths/IsLessonUnlocked.query";

export class GetNextLessonHandler
  implements IQueryHandler<GetNextLessonQuery, Lesson | null>
{
  constructor(
    private readonly isLessonCompletedHandler: IQueryHandlerType<
      ReturnType<typeof isLessonCompletedQuery>,
      boolean
    >,
    private readonly isLessonUnlockedHandler: IQueryHandlerType<
      ReturnType<typeof isLessonUnlockedQuery>,
      boolean
    >,
  ) {}

  async execute(query: GetNextLessonQuery): Promise<Lesson | null> {
    const allLessons = await db
      .select({
        id: lessons.id,
        unitId: lessons.unitId,
        name: lessons.name,
        description: lessons.description,
        orderIndex: lessons.orderIndex,
        xpReward: lessons.xpReward,
        flashcardCount: lessons.flashcardCount,
        createdAt: lessons.createdAt,
      })
      .from(lessons)
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(eq(units.pathId, query.pathId))
      .orderBy(asc(units.unitNumber), asc(lessons.orderIndex));

    for (const lesson of allLessons) {
      const [completed, unlocked] = await Promise.all([
        this.isLessonCompletedHandler.execute(
          isLessonCompletedQuery(lesson.id, query.userId),
        ),
        this.isLessonUnlockedHandler.execute(
          isLessonUnlockedQuery(lesson.id, query.userId),
        ),
      ]);

      if (!completed && unlocked) {
        return {
          id: lesson.id,
          unitId: lesson.unitId,
          name: lesson.name,
          description: lesson.description,
          orderIndex: lesson.orderIndex,
          xpReward: lesson.xpReward,
          flashcardCount: lesson.flashcardCount,
          createdAt: lesson.createdAt,
        };
      }
    }

    return null; // All lessons completed
  }
}
