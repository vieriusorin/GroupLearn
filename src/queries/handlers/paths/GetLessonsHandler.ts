import { and, eq, sql } from "drizzle-orm";
import type { LessonWithProgress } from "@/application/dtos";
import type { GetLessonsResult } from "@/application/dtos/learning-path.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessonCompletions,
  lessons,
  units,
} from "@/infrastructure/database/schema";
import { canAccessPath } from "@/lib/auth/authorization";
import type { GetLessonsQuery } from "@/queries/paths/GetLessons.query";
import { isLessonCompletedQuery } from "@/queries/paths/IsLessonCompleted.query";
import { isLessonUnlockedQuery } from "@/queries/paths/IsLessonUnlocked.query";

async function getBestLessonAccuracy(
  lessonId: number,
  userId: string,
): Promise<number | null> {
  const [result] = await db
    .select({ best: sql<number>`MAX(${lessonCompletions.accuracyPercent})` })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.lessonId, lessonId),
        eq(lessonCompletions.userId, userId),
      ),
    );

  return result.best;
}

async function getLessonCompletionCount(
  lessonId: number,
  userId: string,
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.lessonId, lessonId),
        eq(lessonCompletions.userId, userId),
      ),
    );

  return Number(result.count) || 0;
}

export class GetLessonsHandler
  implements IQueryHandler<GetLessonsQuery, GetLessonsResult>
{
  constructor(
    private readonly isLessonCompletedHandler: IQueryHandler<
      ReturnType<typeof isLessonCompletedQuery>,
      boolean
    >,
    private readonly isLessonUnlockedHandler: IQueryHandler<
      ReturnType<typeof isLessonUnlockedQuery>,
      boolean
    >,
  ) {}

  async execute(query: GetLessonsQuery): Promise<GetLessonsResult> {
    if (!query.unitId || query.unitId <= 0) {
      throw new DomainError("Invalid unit ID", "VALIDATION_ERROR");
    }

    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, query.unitId))
      .limit(1);

    if (!unit) {
      throw new DomainError("Unit not found", "NOT_FOUND");
    }

    const canAccess = await canAccessPath(unit.pathId);
    if (!canAccess) {
      throw new DomainError(
        "Forbidden: You do not have access to this path",
        "FORBIDDEN",
      );
    }

    const lessonsList = await db
      .select()
      .from(lessons)
      .where(eq(lessons.unitId, query.unitId))
      .orderBy(lessons.orderIndex);

    const lessonsWithProgress: LessonWithProgress[] = await Promise.all(
      lessonsList.map(async (lesson) => {
        const bestAccuracy = await getBestLessonAccuracy(
          lesson.id,
          query.userId,
        );
        const completionCount = await getLessonCompletionCount(
          lesson.id,
          query.userId,
        );

        const [isCompleted, isUnlocked] = await Promise.all([
          this.isLessonCompletedHandler.execute(
            isLessonCompletedQuery(lesson.id, query.userId),
          ),
          this.isLessonUnlockedHandler.execute(
            isLessonUnlockedQuery(lesson.id, query.userId),
          ),
        ]);

        return {
          ...lesson,
          isCompleted,
          isUnlocked,
          bestAccuracy,
          completionCount,
          timesFailed: 0,
        };
      }),
    );

    return {
      lessons: lessonsWithProgress,
    };
  }
}
