import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { GetXPHistoryResult } from "@/application/dtos/stats.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { XPTransaction } from "@/infrastructure/database/schema";
import { xpTransactions } from "@/infrastructure/database/schema";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { GetXPHistoryQuery } from "@/queries/stats/GetXPHistory.query";

async function getXPHistory(
  pathId: number,
  limit: number = 50,
): Promise<XPTransaction[]> {
  const transactions = await db
    .select()
    .from(xpTransactions)
    .where(eq(xpTransactions.pathId, pathId))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(limit);

  return transactions;
}

async function getTotalXP(pathId: number): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`SUM(${xpTransactions.amount})` })
    .from(xpTransactions)
    .where(eq(xpTransactions.pathId, pathId));

  return Number(result.total) || 0;
}

const getCachedXPHistory = unstable_cache(getXPHistory, ["xp-history"], {
  tags: [CACHE_TAGS.paths],
});

const getCachedTotalXP = unstable_cache(getTotalXP, ["total-xp"], {
  tags: [CACHE_TAGS.paths],
});

export class GetXPHistoryHandler
  implements IQueryHandler<GetXPHistoryQuery, GetXPHistoryResult>
{
  async execute(query: GetXPHistoryQuery): Promise<GetXPHistoryResult> {
    const limit = query.limit || 50;

    const transactions = await getCachedXPHistory(query.pathId, limit);
    const totalXP = await getCachedTotalXP(query.pathId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const dailyXP = transactions
      .filter((t) => t.createdAt.toISOString() >= todayISO)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    const weekAgoISO = weekAgo.toISOString();

    const weeklyXP = transactions
      .filter((t) => t.createdAt.toISOString() >= weekAgoISO)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      data: {
        transactions,
        totalXp: totalXP,
        dailyXp: dailyXP,
        weeklyXp: weeklyXP,
      },
    };
  }
}
