import { and, eq, gte, lt, max, sql } from "drizzle-orm";
import type { CheckAndResetStreaksCommand } from "@/commands/progress/CheckAndResetStreaks.command";
import type { ICommandHandler, IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { userProgress } from "@/infrastructure/database/schema/gamification.schema";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";
import {
  getCurrentUTCDate,
  getYesterdayUTCDate,
} from "@/lib/gamification/streak-utils";
import type { GetConsecutiveDaysStreakQuery } from "@/queries/progress/GetConsecutiveDaysStreak.query";
import { getConsecutiveDaysStreakQuery } from "@/queries/progress/GetConsecutiveDaysStreak.query";

export class CheckAndResetStreaksHandler
  implements ICommandHandler<CheckAndResetStreaksCommand, void>
{
  constructor(
    private readonly getConsecutiveDaysStreakHandler: IQueryHandler<
      GetConsecutiveDaysStreakQuery,
      number
    >,
  ) {}

  async execute(command: CheckAndResetStreaksCommand): Promise<void> {
    const today = getCurrentUTCDate();
    const yesterday = getYesterdayUTCDate();

    const todayStart = new Date(`${today}T00:00:00.000Z`);
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const yesterdayStart = new Date(`${yesterday}T00:00:00.000Z`);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() + 1);

    const [todayCompletion] = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, command.userId),
          gte(lessonCompletions.completedAt, todayStart),
          lt(lessonCompletions.completedAt, todayEnd),
        ),
      );

    const [yesterdayCompletion] = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, command.userId),
          gte(lessonCompletions.completedAt, yesterdayStart),
          lt(lessonCompletions.completedAt, yesterdayEnd),
        ),
      );

    const [maxStreak] = await db
      .select({ max_streak: max(userProgress.streakCount) })
      .from(userProgress)
      .where(eq(userProgress.userId, command.userId));

    const currentStreak = Number(
      (maxStreak as { max_streak?: number })?.max_streak ?? 0,
    );
    let finalStreak = 0;

    const todayCount = Number(
      (todayCompletion as { count?: number })?.count ?? 0,
    );
    const yesterdayCount = Number(
      (yesterdayCompletion as { count?: number })?.count ?? 0,
    );

    if (todayCount > 0) {
      const query = getConsecutiveDaysStreakQuery(command.userId);
      finalStreak = await this.getConsecutiveDaysStreakHandler.execute(query);
    } else if (yesterdayCount > 0) {
      finalStreak = 1;
    } else {
      finalStreak = 0;
    }

    if (finalStreak !== currentStreak) {
      await db
        .update(userProgress)
        .set({ streakCount: finalStreak })
        .where(eq(userProgress.userId, command.userId));
    }
  }
}
