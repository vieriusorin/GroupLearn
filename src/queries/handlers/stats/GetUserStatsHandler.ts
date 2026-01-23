import { and, eq, gte, lt, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type {
  GetUserStatsResult,
  UserStats,
} from "@/application/dtos/stats.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import {
  userProgress,
  xpTransactions,
} from "@/infrastructure/database/schema/gamification.schema";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";
import type { GetUserStatsQuery } from "@/queries/stats/GetUserStats.query";

async function computeUserStats(userId: string): Promise<UserStats> {
  const [lifetimeXPResult] = await db
    .select({
      total_xp: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`.as(
        "total_xp",
      ),
    })
    .from(xpTransactions)
    .where(eq(xpTransactions.userId, userId));

  const [streakResult] = await db
    .select({
      max_streak: sql<number>`MAX(${userProgress.streakCount})`.as(
        "max_streak",
      ),
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const [lessonsTodayResult] = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`.as(
        "count",
      ),
    })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.completedAt, startOfDay),
        lt(lessonCompletions.completedAt, endOfDay),
      ),
    );

  // Get total lessons completed (all time)
  const [totalLessonsResult] = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`.as(
        "count",
      ),
    })
    .from(lessonCompletions)
    .where(eq(lessonCompletions.userId, userId));

  // Get XP earned today (from XP transactions)
  const [xpTodayResult] = await db
    .select({
      xp_earned: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`.as(
        "xp_earned",
      ),
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startOfDay),
        lt(xpTransactions.createdAt, endOfDay),
      ),
    );

  return {
    totalXp: Number((lifetimeXPResult as { total_xp?: number })?.total_xp ?? 0),
    streakCount: Number(
      (streakResult as { max_streak?: number })?.max_streak ?? 0,
    ),
    lessonsCompletedToday: Number(
      (lessonsTodayResult as { count?: number })?.count ?? 0,
    ),
    totalLessonsCompleted: Number(
      (totalLessonsResult as { count?: number })?.count ?? 0,
    ),
    xpEarnedToday: Number(
      (xpTodayResult as { xp_earned?: number })?.xp_earned ?? 0,
    ),
  };
}

function getCachedUserStats(userId: string): Promise<UserStats> {
  return unstable_cache(
    async () => computeUserStats(userId),
    ["user-stats", userId],
    {
      tags: ["user-stats"],
    },
  )();
}

export class GetUserStatsHandler
  implements IQueryHandler<GetUserStatsQuery, GetUserStatsResult>
{
  async execute(query: GetUserStatsQuery): Promise<GetUserStatsResult> {
    const stats = await getCachedUserStats(query.userId);

    return {
      stats,
    };
  }
}
