/**
 * Server-Side Streak Management Utilities
 *
 * ⚠️ SERVER-ONLY: This module contains database dependencies and should
 * only be imported in server-side code (API routes, server actions, etc.)
 *
 * For client-safe utilities, use streak-utils-pure.ts instead.
 *
 * Based on agent recommendations:
 * - Best Practices: Use UTC for all time operations, lazy evaluation
 * - Performance: Avoid cron jobs, check streak on access
 * - Security: Use UTC to prevent timezone manipulation
 *
 * Streak rules:
 * - Day starts at 12 AM UTC
 * - User must complete at least 1 lesson per day to maintain streak
 * - If user doesn't complete a lesson by midnight UTC, streak resets to 0
 * - All timestamps stored in UTC
 */

import { and, eq, gte, lt, max, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { userProgress } from "@/infrastructure/database/schema/gamification.schema";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";
import {
  getCurrentUTCDate,
  getUTCDateString,
  getYesterdayUTCDate,
} from "./streak-utils-pure";

// Re-export pure utilities for backward compatibility
export {
  calculateStreak,
  getCurrentUTCDate,
  getUTCDateString,
  getYesterdayUTCDate,
  isTodayUTC,
  isYesterdayUTC,
} from "./streak-utils-pure";

/**
 * Check and reset streaks for users who haven't completed today
 * This is called lazily when fetching stats or completing lessons
 * No cron job needed - performance optimized
 */
/**
 * Calculate streak based on consecutive days completed
 * Streak = number of consecutive days with at least 1 lesson completed
 *
 * Examples:
 * - Completed yesterday, not today → streak = 1 (they're on day 1, need to complete today)
 * - Completed today and yesterday → streak = 2 (2 consecutive days)
 * - Completed today but not yesterday → streak = 1 (streak broken, starting new)
 * - No completion in last 2 days → streak = 0
 */
async function calculateConsecutiveDaysStreak(userId: string): Promise<number> {
  const today = getCurrentUTCDate();
  let streak = 0;
  let checkDate = today;

  // Count backwards from today to find consecutive days with completions
  // using date ranges instead of DATE() casting
  while (true) {
    const dayStart = new Date(`${checkDate}T00:00:00.000Z`);
    const nextDay = new Date(dayStart);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const [completion] = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, userId),
          gte(lessonCompletions.completedAt, dayStart),
          lt(lessonCompletions.completedAt, nextDay),
        ),
      );

    const countValue = Number((completion as { count?: number })?.count ?? 0);

    if (countValue > 0) {
      streak++;
      // Check previous day
      const prevDate = new Date(`${checkDate}T00:00:00Z`);
      prevDate.setUTCDate(prevDate.getUTCDate() - 1);
      checkDate = getUTCDateString(prevDate);
    } else {
      // No completion on this day, stop counting
      break;
    }

    // Safety limit to prevent infinite loops
    if (streak > 365) break;
  }

  return streak;
}

export async function checkAndResetStreaks(userId: string): Promise<void> {
  const today = getCurrentUTCDate();
  const yesterday = getYesterdayUTCDate();

  const todayStart = new Date(`${today}T00:00:00.000Z`);
  const todayEnd = new Date(todayStart);
  todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

  const yesterdayStart = new Date(`${yesterday}T00:00:00.000Z`);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() + 1);

  // Check if user completed a lesson today
  const [todayCompletion] = await db
    .select({ count: sql<number>`COUNT(*)`.as("count") })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.completedAt, todayStart),
        lt(lessonCompletions.completedAt, todayEnd),
      ),
    );

  // Check if user completed a lesson yesterday
  const [yesterdayCompletion] = await db
    .select({ count: sql<number>`COUNT(*)`.as("count") })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.userId, userId),
        gte(lessonCompletions.completedAt, yesterdayStart),
        lt(lessonCompletions.completedAt, yesterdayEnd),
      ),
    );

  // Get current streak from user_progress (max across all paths)
  const [maxStreak] = await db
    .select({ max_streak: max(userProgress.streakCount) })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

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

  // Calculate streak based on consecutive days
  if (todayCount > 0) {
    // User completed today - calculate full consecutive streak
    finalStreak = await calculateConsecutiveDaysStreak(userId);
  } else if (yesterdayCount > 0) {
    // User completed yesterday but not today yet
    // Streak is still 1 (they're on day 1, need to complete today to continue)
    finalStreak = 1;
  } else {
    // User hasn't completed today or yesterday - streak is 0
    finalStreak = 0;
  }

  // Update streak if it changed (across all user_progress rows)
  if (finalStreak !== currentStreak) {
    await db
      .update(userProgress)
      .set({ streakCount: finalStreak })
      .where(eq(userProgress.userId, userId));
  }
}

/**
 * Update streak when user completes a lesson
 * Called after lesson completion to maintain streak
 */
export async function updateStreakOnCompletion(
  userId: string,
): Promise<number> {
  // Recalculate streak based on consecutive days
  // This ensures streak is accurate after completing a lesson
  const newStreak = await calculateConsecutiveDaysStreak(userId);

  // Get current streak from user_progress
  const [maxStreak] = await db
    .select({ max_streak: max(userProgress.streakCount) })
    .from(userProgress)
    .where(eq(userProgress.userId, userId));

  const currentStreak = Number(
    (maxStreak as { max_streak?: number })?.max_streak ?? 0,
  );

  // Update streak if it changed
  if (newStreak !== currentStreak) {
    await db
      .update(userProgress)
      .set({ streakCount: newStreak })
      .where(eq(userProgress.userId, userId));
  }

  return newStreak;
}
