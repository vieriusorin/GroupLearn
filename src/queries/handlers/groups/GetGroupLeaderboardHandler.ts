import { and, asc, desc, eq, sql } from "drizzle-orm";
import type {
  GetGroupLeaderboardResult,
  GroupLeaderboardEntry,
} from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { groupMemberAnalytics } from "@/infrastructure/database/schema/analytics.schema";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { dailyStreaks } from "@/infrastructure/database/schema/gamification.schema";
import { groupMembers } from "@/infrastructure/database/schema/groups.schema";
import type { GetGroupLeaderboardQuery } from "@/queries/groups/GetGroupLeaderboard.query";

export class GetGroupLeaderboardHandler
  implements IQueryHandler<GetGroupLeaderboardQuery, GetGroupLeaderboardResult>
{
  async execute(
    query: GetGroupLeaderboardQuery,
  ): Promise<GetGroupLeaderboardResult> {
    const limit = query.limit || 10;

    const entries = await db
      .select({
        userId: users.id,
        userName: users.name,
        lessonsCompleted: sql<number>`COALESCE(${groupMemberAnalytics.totalLessonsCompleted}, 0)`,
        timeSpent: sql<number>`COALESCE(${groupMemberAnalytics.totalTimeSpent}, 0)`,
        score: sql<number>`COALESCE(${groupMemberAnalytics.averageScore}, 0) * 10`,
        streak: sql<number>`COALESCE(${dailyStreaks.currentStreak}, 0)`,
      })
      .from(groupMembers)
      .innerJoin(users, eq(users.id, groupMembers.userId))
      .leftJoin(
        groupMemberAnalytics,
        and(
          eq(groupMemberAnalytics.userId, users.id),
          eq(groupMemberAnalytics.groupId, groupMembers.groupId),
        ),
      )
      .leftJoin(dailyStreaks, eq(dailyStreaks.userId, users.id))
      .where(eq(groupMembers.groupId, query.groupId))
      .orderBy(
        desc(sql`COALESCE(${groupMemberAnalytics.averageScore}, 0) * 10`),
        desc(sql`COALESCE(${groupMemberAnalytics.totalLessonsCompleted}, 0)`),
        asc(sql`COALESCE(${groupMemberAnalytics.totalTimeSpent}, 0)`),
      )
      .limit(limit);

    const leaderboard: GroupLeaderboardEntry[] = entries.map(
      (entry, index) => ({
        userId: entry.userId,
        userName: entry.userName ?? "",
        score: Math.round(Number(entry.score)),
        lessonsCompleted: Number(entry.lessonsCompleted),
        timeSpent: Number(entry.timeSpent),
        streak: Number(entry.streak),
        rank: index + 1,
      }),
    );

    return {
      leaderboard,
    };
  }
}
