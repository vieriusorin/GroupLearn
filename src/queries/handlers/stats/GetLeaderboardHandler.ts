import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type {
  GetLeaderboardResult,
  GlobalLeaderboardEntry,
  LeaderboardData,
} from "@/application/dtos/stats.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { users, xpTransactions } from "@/infrastructure/database/schema";
import type { GetLeaderboardQuery } from "@/queries/stats/GetLeaderboard.query";

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

async function getTopUsersByXP(
  limit: number = 10,
  startDate: string | null = null,
  endDate: string | null = null,
): Promise<GlobalLeaderboardEntry[]> {
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
    userId: row.userId,
    userName: row.userName,
    userEmail: row.userEmail,
    totalXp: Number(row.totalXp) || 0,
    rank: index + 1,
  }));
}

async function getTopUsersAllTime(
  limit: number = 10,
): Promise<GlobalLeaderboardEntry[]> {
  return getTopUsersByXP(limit, null, null);
}

async function getTopUsersLast7Days(
  limit: number = 10,
): Promise<GlobalLeaderboardEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const start = sevenDaysAgo.toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];

  return getTopUsersByXP(limit, start, end);
}

async function getTopUsersLast30Days(
  limit: number = 10,
): Promise<GlobalLeaderboardEntry[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const start = thirtyDaysAgo.toISOString().split("T")[0];
  const end = today.toISOString().split("T")[0];

  return getTopUsersByXP(limit, start, end);
}

// Cached versions
const getCachedTopUsersAllTime = unstable_cache(
  getTopUsersAllTime,
  ["leaderboard-all-time"],
  {
    tags: ["leaderboard:all-time"],
  },
);

const getCachedTopUsersLast7Days = unstable_cache(
  getTopUsersLast7Days,
  ["leaderboard-7days"],
  {
    tags: ["leaderboard:7days"],
  },
);

const getCachedTopUsersLast30Days = unstable_cache(
  getTopUsersLast30Days,
  ["leaderboard-30days"],
  {
    tags: ["leaderboard:30days"],
  },
);

async function getUserRankWithContext(
  userId: string,
  startDate: string | null = null,
  endDate: string | null = null,
  contextSize: number = 2,
): Promise<{
  userRank: number | null;
  userXP: number;
  leaderboard: GlobalLeaderboardEntry[];
}> {
  // Get all users with XP in the date range, ranked
  const allUsers = await getTopUsersByXP(1000, startDate, endDate); // Get enough to find user

  // Find user's rank
  const userIndex = allUsers.findIndex((entry) => entry.userId === userId);
  const userRank = userIndex >= 0 ? userIndex + 1 : null;
  const userXP = userIndex >= 0 ? allUsers[userIndex].totalXp : 0;

  // Get context (users around the user's rank)
  let leaderboard: GlobalLeaderboardEntry[] = [];
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

export class GetLeaderboardHandler
  implements IQueryHandler<GetLeaderboardQuery, GetLeaderboardResult>
{
  async execute(query: GetLeaderboardQuery): Promise<GetLeaderboardResult> {
    const period = query.period || "all-time";
    const limit = query.limit || 10;

    let leaderboard: LeaderboardData["leaderboard"];
    switch (period) {
      case "7days":
        leaderboard = await getCachedTopUsersLast7Days(limit);
        break;
      case "30days":
        leaderboard = await getCachedTopUsersLast30Days(limit);
        break;
      default:
        leaderboard = await getCachedTopUsersAllTime(limit);
        break;
    }

    const userContext = await getUserRankWithContext(
      query.userId,
      null,
      null,
      2,
    );

    return {
      data: {
        period,
        leaderboard,
        userRank: userContext.userRank,
        userXP: userContext.userXP,
      },
    };
  }
}
