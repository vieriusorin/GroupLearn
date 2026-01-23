import { and, eq, sql } from "drizzle-orm";
import type {
  GetGroupAnalyticsResult,
  GroupAnalytics,
} from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import {
  groupMemberAnalytics,
  groupMembers,
  groupPaths,
  groups,
  lessons,
  units,
  userActivityLog,
} from "@/infrastructure/database/schema";
import type { GetGroupAnalyticsQuery } from "@/queries/groups/GetGroupAnalytics.query";

export class GetGroupAnalyticsHandler
  implements IQueryHandler<GetGroupAnalyticsQuery, GetGroupAnalyticsResult>
{
  async execute(
    query: GetGroupAnalyticsQuery,
  ): Promise<GetGroupAnalyticsResult> {
    const [group] = await db
      .select({ id: groups.id, name: groups.name })
      .from(groups)
      .where(eq(groups.id, query.groupId))
      .limit(1);

    if (!group) {
      throw new DomainError("Group not found", "NOT_FOUND");
    }

    const [memberCountResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, query.groupId));

    const [pathsCountResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(groupPaths)
      .where(eq(groupPaths.groupId, query.groupId));

    const [analyticsResult] = await db
      .select({
        lessons: sql<number>`SUM(${groupMemberAnalytics.totalLessonsCompleted})`,
        flashcards: sql<number>`SUM(${groupMemberAnalytics.totalFlashcardsReviewed})`,
        time: sql<number>`SUM(${groupMemberAnalytics.totalTimeSpent})`,
        score: sql<number>`AVG(${groupMemberAnalytics.averageScore})`,
      })
      .from(groupMemberAnalytics)
      .where(eq(groupMemberAnalytics.groupId, query.groupId));

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [activeMembersResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${userActivityLog.userId})` })
      .from(userActivityLog)
      .where(
        and(
          eq(userActivityLog.groupId, query.groupId),
          sql`${userActivityLog.createdAt} >= ${sevenDaysAgo.toISOString()}`,
        ),
      );

    const [assignedLessonsResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${lessons.id})` })
      .from(groupPaths)
      .innerJoin(units, eq(units.pathId, groupPaths.pathId))
      .innerJoin(lessons, eq(lessons.unitId, units.id))
      .where(eq(groupPaths.groupId, query.groupId));

    const memberCount = Number(memberCountResult.count) || 0;
    const lessonsCompleted = Number(analyticsResult.lessons) || 0;
    const assignedLessonsCount = Number(assignedLessonsResult.count) || 0;

    const completionRate =
      assignedLessonsCount > 0 && memberCount > 0
        ? (lessonsCompleted / (assignedLessonsCount * memberCount)) * 100
        : 0;

    const analytics: GroupAnalytics = {
      groupId: group.id,
      groupName: group.name,
      memberCount,
      totalPathsAssigned: Number(pathsCountResult.count) || 0,
      totalLessonsCompleted: lessonsCompleted,
      totalFlashcardsReviewed: Number(analyticsResult.flashcards) || 0,
      totalTimeSpent: Number(analyticsResult.time) || 0,
      averageScore: Number(analyticsResult.score) || 0,
      activeMembers: Number(activeMembersResult.count) || 0,
      completionRate: Math.round(completionRate * 10) / 10,
    };

    return {
      analytics,
    };
  }
}
