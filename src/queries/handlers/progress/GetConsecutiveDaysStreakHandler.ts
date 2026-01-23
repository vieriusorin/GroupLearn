import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";
import {
  getCurrentUTCDate,
  getUTCDateString,
} from "@/lib/gamification/streak-utils";
import type { GetConsecutiveDaysStreakQuery } from "@/queries/progress/GetConsecutiveDaysStreak.query";

export class GetConsecutiveDaysStreakHandler
  implements IQueryHandler<GetConsecutiveDaysStreakQuery, number>
{
  async execute(query: GetConsecutiveDaysStreakQuery): Promise<number> {
    const today = getCurrentUTCDate();
    let streak = 0;
    let checkDate = today;

    while (true) {
      const dayStart = new Date(`${checkDate}T00:00:00.000Z`);
      const nextDay = new Date(dayStart);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      const [completion] = await db
        .select({ count: sql<number>`COUNT(*)`.as("count") })
        .from(lessonCompletions)
        .where(
          and(
            eq(lessonCompletions.userId, query.userId),
            gte(lessonCompletions.completedAt, dayStart),
            lt(lessonCompletions.completedAt, nextDay),
          ),
        );

      const countValue = Number((completion as { count?: number })?.count ?? 0);

      if (countValue > 0) {
        streak++;
        const prevDate = new Date(`${checkDate}T00:00:00Z`);
        prevDate.setUTCDate(prevDate.getUTCDate() - 1);
        checkDate = getUTCDateString(prevDate);
      } else {
        break;
      }

      if (streak > 365) break;
    }

    return streak;
  }
}
