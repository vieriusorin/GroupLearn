import { eq } from "drizzle-orm";
import type {
  IQueryHandler,
  IQueryHandler as IQueryHandlerType,
} from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { units } from "@/infrastructure/database/schema/learning-path.schema";
import type { IsPathCompletedQuery } from "@/queries/paths/IsPathCompleted.query";
import { isUnitCompletedQuery } from "@/queries/paths/IsUnitCompleted.query";

export class IsPathCompletedHandler
  implements IQueryHandler<IsPathCompletedQuery, boolean>
{
  constructor(
    private readonly isUnitCompletedHandler: IQueryHandlerType<
      ReturnType<typeof isUnitCompletedQuery>,
      boolean
    >,
  ) {}

  async execute(query: IsPathCompletedQuery): Promise<boolean> {
    const unitsInPath = await db
      .select({ id: units.id })
      .from(units)
      .where(eq(units.pathId, query.pathId));

    if (unitsInPath.length === 0) return false;

    for (const unit of unitsInPath) {
      const unitQuery = isUnitCompletedQuery(unit.id, query.userId);
      const isCompleted = await this.isUnitCompletedHandler.execute(unitQuery);
      if (!isCompleted) {
        return false;
      }
    }

    return true;
  }
}
