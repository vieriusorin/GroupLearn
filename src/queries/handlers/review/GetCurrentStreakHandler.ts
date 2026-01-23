import { desc, sql } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { reviewHistory as reviewHistoryTable } from "@/infrastructure/database/schema";
import type { GetCurrentStreakQuery } from "@/queries/review/GetCurrentStreak.query";

export class GetCurrentStreakHandler
  implements IQueryHandler<GetCurrentStreakQuery, number>
{
  async execute(_query: GetCurrentStreakQuery): Promise<number> {
    // Get distinct review dates (by day) in descending order
    const rows = await db
      .select({
        reviewDay: sql<string>`DATE(${reviewHistoryTable.reviewDate})`,
      })
      .from(reviewHistoryTable)
      .groupBy(sql`DATE(${reviewHistoryTable.reviewDate})`)
      .orderBy(desc(sql`DATE(${reviewHistoryTable.reviewDate})`));

    if (rows.length === 0) {
      return 0;
    }

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const row of rows) {
      const reviewDate = new Date(row.reviewDay);
      reviewDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  }
}
