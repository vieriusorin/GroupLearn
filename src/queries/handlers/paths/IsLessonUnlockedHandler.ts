import { and, eq } from "drizzle-orm";
import type {
  IQueryHandler,
  IQueryHandler as IQueryHandlerType,
} from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessons,
  units,
} from "@/infrastructure/database/schema/learning-path.schema";
import { isLessonCompletedQuery } from "@/queries/paths/IsLessonCompleted.query";
import type { IsLessonUnlockedQuery } from "@/queries/paths/IsLessonUnlocked.query";
import { isUnitCompletedQuery } from "@/queries/paths/IsUnitCompleted.query";

export class IsLessonUnlockedHandler
  implements IQueryHandler<IsLessonUnlockedQuery, boolean>
{
  constructor(
    private readonly isLessonCompletedHandler: IQueryHandlerType<
      ReturnType<typeof isLessonCompletedQuery>,
      boolean
    >,
    private readonly isUnitCompletedHandler: IQueryHandlerType<
      ReturnType<typeof isUnitCompletedQuery>,
      boolean
    >,
  ) {}

  async execute(query: IsLessonUnlockedQuery): Promise<boolean> {
    const [lesson] = await db
      .select({
        id: lessons.id,
        unitId: lessons.unitId,
        orderIndex: lessons.orderIndex,
        unitNumber: units.unitNumber,
        pathId: units.pathId,
      })
      .from(lessons)
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(eq(lessons.id, query.lessonId))
      .limit(1);

    if (!lesson) return false;

    if (lesson.unitNumber === 1 && lesson.orderIndex === 0) {
      return true;
    }

    if (lesson.orderIndex > 0) {
      const [prevLesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(
          and(
            eq(lessons.unitId, lesson.unitId),
            eq(lessons.orderIndex, lesson.orderIndex - 1),
          ),
        )
        .limit(1);

      if (prevLesson) {
        const prevLessonQuery = isLessonCompletedQuery(
          prevLesson.id,
          query.userId,
        );
        return await this.isLessonCompletedHandler.execute(prevLessonQuery);
      }

      return false;
    }

    if (lesson.orderIndex === 0 && lesson.unitNumber > 1) {
      const [prevUnit] = await db
        .select({ id: units.id })
        .from(units)
        .where(
          and(
            eq(units.pathId, lesson.pathId),
            eq(units.unitNumber, lesson.unitNumber - 1),
          ),
        )
        .limit(1);

      if (prevUnit) {
        const prevUnitQuery = isUnitCompletedQuery(prevUnit.id, query.userId);
        return await this.isUnitCompletedHandler.execute(prevUnitQuery);
      }

      return false;
    }

    return false;
  }
}
