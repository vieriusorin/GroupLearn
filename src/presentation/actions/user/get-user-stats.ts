"use server";

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/infrastructure/database/drizzle";
import {
  userProgress,
  xpTransactions,
} from "@/infrastructure/database/schema/gamification.schema";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";
import { checkAndResetStreaks } from "@/lib/streak-utils";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

type UserStats = {
  total_xp: number;
  streak_count: number;
  lessons_completed_today: number;
  total_lessons_completed: number;
  xp_earned_today: number;
};

const getCachedUserStats = unstable_cache(
  async (userId: string): Promise<UserStats> => {
    // Get lifetime XP from xp_transactions (source of truth with dates)
    const [lifetimeXPResult] = await db
      .select({
        total_xp: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`.as(
          "total_xp",
        ),
      })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId));

    // Get current streak (max streak across all paths)
    const [streakResult] = await db
      .select({
        max_streak: sql<number>`MAX(${userProgress.streakCount})`.as(
          "max_streak",
        ),
      })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    // Get lessons completed today
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
      total_xp: Number(
        (lifetimeXPResult as { total_xp?: number })?.total_xp ?? 0,
      ),
      streak_count: Number(
        (streakResult as { max_streak?: number })?.max_streak ?? 0,
      ),
      lessons_completed_today: Number(
        (lessonsTodayResult as { count?: number })?.count ?? 0,
      ),
      total_lessons_completed: Number(
        (totalLessonsResult as { count?: number })?.count ?? 0,
      ),
      xp_earned_today: Number(
        (xpTodayResult as { xp_earned?: number })?.xp_earned ?? 0,
      ),
    };
  },
  ["user-stats"],
  { tags: ["user-stats"] },
);

/**
 * Server Action: Get user statistics
 *
 * @returns ActionResult with user stats or error
 */
export async function getUserStats(): Promise<ActionResult<UserStats>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      // Check and reset streaks lazily (no cron job needed)
      await checkAndResetStreaks(user.id);

      const stats = await getCachedUserStats(user.id);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch user stats",
        code: "FETCH_ERROR",
      };
    }
  });
}
