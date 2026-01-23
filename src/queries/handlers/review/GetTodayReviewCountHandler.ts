import { and, gte, lt, sql } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { reviewHistory as reviewHistoryTable } from "@/infrastructure/database/schema";
import type { GetTodayReviewCountQuery } from "@/queries/review/GetTodayReviewCount.query";

export class GetTodayReviewCountHandler
  implements IQueryHandler<GetTodayReviewCountQuery, number>
{
  async execute(_query: GetTodayReviewCountQuery): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const [row] = await db
      .select({
        count: sql<number>`COUNT(*)`.as("count"),
      })
      .from(reviewHistoryTable)
      .where(
        and(
          gte(reviewHistoryTable.reviewDate, today),
          lt(reviewHistoryTable.reviewDate, tomorrow),
        ),
      );

    return row?.count ?? 0;
  }
}
