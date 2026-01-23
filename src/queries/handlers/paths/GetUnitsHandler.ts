import { and, eq, sql } from "drizzle-orm";
import type { UnitWithProgress } from "@/application/dtos";
import type { GetUnitsResult } from "@/application/dtos/learning-path.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessonCompletions,
  lessons,
  units,
} from "@/infrastructure/database/schema";
import { canAccessPath } from "@/lib/auth/authorization";
import { calculateDifficultyFromUnit } from "@/lib/gamification/gamification";
import type { GetUnitsQuery } from "@/queries/paths/GetUnits.query";
import { isUnitUnlockedQuery } from "@/queries/paths/IsUnitUnlocked.query";

export class GetUnitsHandler
  implements IQueryHandler<GetUnitsQuery, GetUnitsResult>
{
  constructor(
    private readonly isUnitUnlockedHandler: IQueryHandler<
      ReturnType<typeof isUnitUnlockedQuery>,
      boolean
    >,
  ) {}

  async execute(query: GetUnitsQuery): Promise<GetUnitsResult> {
    if (!query.pathId || query.pathId <= 0) {
      throw new DomainError("Invalid path ID", "VALIDATION_ERROR");
    }

    const canAccess = await canAccessPath(query.pathId);
    if (!canAccess) {
      throw new DomainError(
        "Forbidden: You do not have access to this path",
        "FORBIDDEN",
      );
    }

    const unitsList = await db
      .select()
      .from(units)
      .where(eq(units.pathId, query.pathId))
      .orderBy(units.orderIndex);

    const unitsWithProgress: UnitWithProgress[] = await Promise.all(
      unitsList.map(async (unit) => {
        const difficulty = calculateDifficultyFromUnit(unit.unitNumber);

        const [counts] = await db
          .select({ total: sql<number>`COUNT(*)` })
          .from(lessons)
          .where(eq(lessons.unitId, unit.id));

        const [completed] = await db
          .select({
            completed: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
          })
          .from(lessonCompletions)
          .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
          .where(
            and(
              eq(lessons.unitId, unit.id),
              eq(lessonCompletions.userId, query.userId),
            ),
          );

        const totalLessons = Number(counts.total) || 0;
        const completedLessons = Number(completed.completed) || 0;
        const completionPercent =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        const isUnlocked = await this.isUnitUnlockedHandler.execute(
          isUnitUnlockedQuery(unit.id, query.userId),
        );

        return {
          ...unit,
          difficulty,
          totalLessons,
          completedLessons,
          completionPercent,
          isUnlocked,
        };
      }),
    );

    return {
      units: unitsWithProgress,
    };
  }
}
