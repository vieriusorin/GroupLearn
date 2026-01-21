/**
 * Leaderboard Utilities
 *
 * Provides functions to query user XP rankings for different time periods:
 * - All-time (lifetime)
 * - Last 7 days
 * - Last 30 days
 * - Custom date ranges
 *
 * All queries use xp_transactions table which has created_at dates in UTC
 */

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/infrastructure/database/drizzle";
import { users, xpTransactions } from "@/infrastructure/database/schema";

export interface LeaderboardEntry {
  user_id: string;
  user_name: string | null;
  user_email: string;
  total_xp: number;
  rank: number;
}

function toDateBoundary(dateStr: string | null, isStart: boolean): Date | null {
  if (!dateStr) {
    return null;
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  if (isStart) {
    d.setHours(0, 0, 0, 0);
  } else {
    d.setHours(23, 59, 59, 999);
  }
  return d;
}

/**
 * Get top N users by XP for a specific date range
 * @param limit - Number of top users to return (default: 10)
 * @param startDate - Start date in UTC (YYYY-MM-DD format) or null for all-time
 * @param endDate - End date in UTC (YYYY-MM-DD format) or null for today
 * @returns Array of leaderboard entries sorted by XP descending
 */
export async function getTopUsersByXP(
  limit: number = 10,
  startDate: string | null = null,
  endDate: string | null = null,
): Promise<LeaderboardEntry[]> {
  const from = toDateBoundary(startDate, true);
  const to = toDateBoundary(endDate, false);

  const conditions: any[] = [];
  if (from) {
    conditions.push(gte(xpTransactions.createdAt, from));
  }
  if (to) {
    conditions.push(lte(xpTransactions.createdAt, to));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      totalXp: sql<number>`COALESCE(SUM(${xpTransactions.amount}), 0)`,
    })
    .from(users)
    .leftJoin(xpTransactions, eq(users.id, xpTransactions.userId))
    .where(whereClause as any)
    .groupBy(users.id, users.name, users.email)
    .having(sql`COALESCE(SUM(${xpTransactions.amount}), 0) > 0`)
    .orderBy(desc(sql`COALESCE(SUM(${xpTransactions.amount}), 0)`))
    .limit(limit);

  return rows.map((row, index) => ({
    user_id: row.userId,
    user_name: row.userName,
    user_email: row.userEmail,
    total_xp: row.totalXp,
    rank: index + 1,
  }));
}

/**
 * Get top N users by lifetime XP (all-time)
 */
export async function getTopUsersAllTime(
  limit: number = 10,
): Promise<LeaderboardEntry[]> {
  return getTopUsersByXP(limit, null, null);
}

/**
 * Get top N users by XP in the last 7 days
 */
export async function getTopUsersLast7Days(
  limit: number = 10,
): Promise<LeaderboardEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const start = sevenDaysAgo.toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];

  return getTopUsersByXP(limit, start, end);
}

/**
 * Get top N users by XP in the last 30 days
 */
export async function getTopUsersLast30Days(
  limit: number = 10,
): Promise<LeaderboardEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const start = thirtyDaysAgo.toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];

  return getTopUsersByXP(limit, start, end);
}

// Cached versions of leaderboard functions
export const getCachedTopUsersAllTime = unstable_cache(
  getTopUsersAllTime,
  ["leaderboard-all-time"],
  {
    tags: ["leaderboard:all-time"],
  },
);

export const getCachedTopUsersLast7Days = unstable_cache(
  getTopUsersLast7Days,
  ["leaderboard-7days"],
  {
    tags: ["leaderboard:7days"],
  },
);

export const getCachedTopUsersLast30Days = unstable_cache(
  getTopUsersLast30Days,
  ["leaderboard-30days"],
  {
    tags: ["leaderboard:30days"],
  },
);

/**
 * Get user's rank and surrounding users for a specific time period
 * @param userId - User ID to get rank for
 * @param startDate - Start date in UTC (YYYY-MM-DD) or null for all-time
 * @param endDate - End date in UTC (YYYY-MM-DD) or null for today
 * @param contextSize - Number of users above and below to include (default: 2)
 * @returns Object with user's rank, XP, and surrounding leaderboard entries
 */
export async function getUserRankWithContext(
  userId: string,
  startDate: string | null = null,
  endDate: string | null = null,
  contextSize: number = 2,
): Promise<{
  userRank: number | null;
  userXP: number;
  leaderboard: LeaderboardEntry[];
}> {
  // Get all users with XP in the date range, ranked
  const allUsers = await getTopUsersByXP(1000, startDate, endDate); // Get enough to find user

  // Find user's rank
  const userIndex = allUsers.findIndex((entry) => entry.user_id === userId);
  const userRank = userIndex >= 0 ? userIndex + 1 : null;
  const userXP = userIndex >= 0 ? allUsers[userIndex].total_xp : 0;

  // Get context (users around the user's rank)
  let leaderboard: LeaderboardEntry[] = [];
  if (userRank !== null) {
    const startIndex = Math.max(0, userIndex - contextSize);
    const endIndex = Math.min(allUsers.length, userIndex + contextSize + 1);
    leaderboard = allUsers.slice(startIndex, endIndex);
  } else {
    // User not in top 1000, just return top users
    leaderboard = allUsers.slice(0, 10);
  }

  return {
    userRank,
    userXP,
    leaderboard,
  };
}
