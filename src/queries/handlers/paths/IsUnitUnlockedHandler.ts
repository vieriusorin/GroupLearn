import { and, eq } from "drizzle-orm";
import type {
  IQueryHandler,
  IQueryHandler as IQueryHandlerType,
} from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { units } from "@/infrastructure/database/schema/learning-path.schema";
import { isUnitCompletedQuery } from "@/queries/paths/IsUnitCompleted.query";
import type { IsUnitUnlockedQuery } from "@/queries/paths/IsUnitUnlocked.query";

export class IsUnitUnlockedHandler
  implements IQueryHandler<IsUnitUnlockedQuery, boolean>
{
  constructor(
    private readonly isUnitCompletedHandler: IQueryHandlerType<
      ReturnType<typeof isUnitCompletedQuery>,
      boolean
    >,
  ) {}

  async execute(query: IsUnitUnlockedQuery): Promise<boolean> {
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, query.unitId))
      .limit(1);

    if (!unit) return false;

    if (unit.unitNumber === 1) return true;

    const [prevUnit] = await db
      .select({ id: units.id })
      .from(units)
      .where(
        and(
          eq(units.pathId, unit.pathId),
          eq(units.unitNumber, unit.unitNumber - 1),
        ),
      )
      .limit(1);

    if (!prevUnit) return true; // No previous unit, unlock

    const prevUnitQuery = isUnitCompletedQuery(prevUnit.id, query.userId);
    return await this.isUnitCompletedHandler.execute(prevUnitQuery);
  }
}
