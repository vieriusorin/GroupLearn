import { and, eq } from "drizzle-orm";
import type {
  IQueryHandler,
  IQueryHandler as IQueryHandlerType,
} from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { userProgress } from "@/infrastructure/database/schema/gamification.schema";
import { paths } from "@/infrastructure/database/schema/learning-path.schema";
import { isPathCompletedQuery } from "@/queries/paths/IsPathCompleted.query";
import type { IsPathUnlockedQuery } from "@/queries/paths/IsPathUnlocked.query";

export class IsPathUnlockedHandler
  implements IQueryHandler<IsPathUnlockedQuery, boolean>
{
  constructor(
    private readonly isPathCompletedHandler: IQueryHandlerType<
      ReturnType<typeof isPathCompletedQuery>,
      boolean
    >,
  ) {}

  async execute(query: IsPathUnlockedQuery): Promise<boolean> {
    const [path] = await db
      .select()
      .from(paths)
      .where(eq(paths.id, query.pathId))
      .limit(1);

    if (!path) return false;

    if (path.isLocked) return false;

    if (!path.unlockRequirementType || path.unlockRequirementType === "none") {
      return true;
    }

    if (path.unlockRequirementType === "previous_path") {
      if (!path.unlockRequirementValue) return true;

      const [prevPath] = await db
        .select({ id: paths.id })
        .from(paths)
        .where(eq(paths.id, path.unlockRequirementValue))
        .limit(1);

      if (!prevPath) return true; // Previous path doesn't exist, unlock

      const prevPathQuery = isPathCompletedQuery(prevPath.id, query.userId);
      return await this.isPathCompletedHandler.execute(prevPathQuery);
    }

    if (path.unlockRequirementType === "xp_threshold") {
      if (!path.unlockRequirementValue) return true;

      const [progress] = await db
        .select({ totalXp: userProgress.totalXp })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.pathId, query.pathId),
            eq(userProgress.userId, query.userId),
          ),
        )
        .limit(1);

      const totalXP = progress?.totalXp || 0;
      return totalXP >= path.unlockRequirementValue;
    }

    return true;
  }
}
