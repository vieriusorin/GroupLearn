import { and, eq, sql } from "drizzle-orm";
import type {
  GetMemberProgressResult,
  MemberProgress,
  PathProgress,
} from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessonCompletions,
  lessons,
  paths,
  units,
  userActivityLog,
  userProgress,
} from "@/infrastructure/database/schema";
import { groupMemberAnalytics } from "@/infrastructure/database/schema/analytics.schema";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { ActivityType } from "@/infrastructure/database/schema/enums";
import { dailyStreaks } from "@/infrastructure/database/schema/gamification.schema";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import type { GetMemberProgressQuery } from "@/queries/groups/GetMemberProgress.query";

async function getPathsProgressForMember(
  userId: string,
  groupId: number,
): Promise<PathProgress[]> {
  const pathsList = await db
    .select({ id: paths.id, name: paths.name })
    .from(groupPaths)
    .innerJoin(paths, eq(paths.id, groupPaths.pathId))
    .leftJoin(
      groupPathVisibility,
      and(
        eq(groupPathVisibility.groupId, groupPaths.groupId),
        eq(groupPathVisibility.pathId, groupPaths.pathId),
      ),
    )
    .where(
      and(
        eq(groupPaths.groupId, groupId),
        sql`COALESCE(${groupPathVisibility.isVisible}, true) = true`,
      ),
    );

  const pathsProgress = await Promise.all(
    pathsList.map(async (path) => {
      const [unitsTotalResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(units)
        .where(eq(units.pathId, path.id));

      const [lessonsTotalResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${lessons.id})` })
        .from(units)
        .innerJoin(lessons, eq(lessons.unitId, units.id))
        .where(eq(units.pathId, path.id));

      const [lessonsCompletedResult] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${lessons.id})`,
        })
        .from(lessonCompletions)
        .innerJoin(lessons, eq(lessons.id, lessonCompletions.lessonId))
        .innerJoin(units, eq(units.id, lessons.unitId))
        .where(
          and(eq(units.pathId, path.id), eq(lessonCompletions.userId, userId)),
        );

      const [unitsCompletedResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${units.id})` })
        .from(units)
        .where(
          and(
            eq(units.pathId, path.id),
            sql`NOT EXISTS (
              SELECT 1
              FROM ${lessons}
              LEFT JOIN ${lessonCompletions}
                ON ${lessons.id} = ${lessonCompletions.lessonId}
               AND ${lessonCompletions.userId} = ${userId}
              WHERE ${lessons.unitId} = ${units.id}
                AND ${lessonCompletions.id} IS NULL
            )`,
          ),
        );

      const [timeSpentResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${userProgress.timeSpentTotal}), 0)`,
        })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.pathId, path.id),
          ),
        );

      const [avgScoreResult] = await db
        .select({
          avg: sql<number>`AVG(CAST((${userActivityLog.activityDetails}::jsonb->>'score') AS REAL))`,
        })
        .from(userActivityLog)
        .where(
          and(
            eq(userActivityLog.userId, userId),
            eq(userActivityLog.groupId, groupId),
            eq(userActivityLog.activityType, ActivityType.LESSON_COMPLETED),
            sql`${userActivityLog.activityDetails}::jsonb->>'pathId' = ${path.id.toString()}`,
            sql`${userActivityLog.activityDetails}::jsonb->>'score' IS NOT NULL`,
          ),
        );

      const lessonsTotalCount = Number(lessonsTotalResult.count) || 0;
      const lessonsCompletedCount = Number(lessonsCompletedResult.count) || 0;
      const completionRate =
        lessonsTotalCount > 0
          ? (lessonsCompletedCount / lessonsTotalCount) * 100
          : 0;

      return {
        pathId: path.id,
        pathName: path.name,
        unitsCompleted: Number(unitsCompletedResult.count) || 0,
        unitsTotal: Number(unitsTotalResult.count) || 0,
        lessonsCompleted: lessonsCompletedCount,
        lessonsTotal: lessonsTotalCount,
        completionRate: Math.round(completionRate * 10) / 10,
        timeSpent: Number(timeSpentResult.total) || 0,
        averageScore: Math.round((Number(avgScoreResult.avg) || 0) * 10) / 10,
      };
    }),
  );

  return pathsProgress;
}

export class GetMemberProgressHandler
  implements IQueryHandler<GetMemberProgressQuery, GetMemberProgressResult>
{
  async execute(
    query: GetMemberProgressQuery,
  ): Promise<GetMemberProgressResult> {
    const [membership] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, query.groupId),
          eq(groupMembers.userId, query.userId),
        ),
      )
      .limit(1);

    const [userRecord] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, query.userId))
      .limit(1);

    const isAdmin =
      userRecord?.role === "admin" || membership?.role === "admin";
    const isViewingSelf = query.userId === query.targetUserId;

    if (!userRecord || (!isAdmin && !isViewingSelf)) {
      throw new DomainError(
        "You do not have permission to view this member's progress",
        "FORBIDDEN",
      );
    }

    const [targetUser] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, query.targetUserId))
      .limit(1);

    if (!targetUser) {
      throw new DomainError("User not found", "NOT_FOUND");
    }

    const [analyticsData] = await db
      .select()
      .from(groupMemberAnalytics)
      .where(
        and(
          eq(groupMemberAnalytics.userId, query.targetUserId),
          eq(groupMemberAnalytics.groupId, query.groupId),
        ),
      )
      .limit(1);

    const [totalLessonsResult] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${lessons.id})` })
      .from(groupPaths)
      .innerJoin(units, eq(units.pathId, groupPaths.pathId))
      .innerJoin(lessons, eq(lessons.unitId, units.id))
      .leftJoin(
        groupPathVisibility,
        and(
          eq(groupPathVisibility.groupId, groupPaths.groupId),
          eq(groupPathVisibility.pathId, groupPaths.pathId),
        ),
      )
      .where(
        and(
          eq(groupPaths.groupId, query.groupId),
          sql`COALESCE(${groupPathVisibility.isVisible}, true) = true`,
        ),
      );

    const [streakData] = await db
      .select({ currentStreak: dailyStreaks.currentStreak })
      .from(dailyStreaks)
      .where(eq(dailyStreaks.userId, query.targetUserId))
      .limit(1);

    const pathsProgress = await getPathsProgressForMember(
      query.targetUserId,
      query.groupId,
    );

    const lessonsCompleted = analyticsData?.totalLessonsCompleted || 0;
    const totalLessonsCount = Number(totalLessonsResult.count) || 0;
    const completionRate =
      totalLessonsCount > 0 ? (lessonsCompleted / totalLessonsCount) * 100 : 0;

    const progress: MemberProgress = {
      userId: targetUser.id,
      userName: targetUser.name ?? "",
      userEmail: targetUser.email,
      lessonsCompleted,
      lessonsTotal: totalLessonsCount,
      completionRate: Math.round(completionRate * 10) / 10,
      flashcardsReviewed: analyticsData?.totalFlashcardsReviewed || 0,
      totalTimeSpent: analyticsData?.totalTimeSpent || 0,
      averageScore: analyticsData?.averageScore || 0,
      currentStreak: streakData?.currentStreak || 0,
      lastActivityAt: analyticsData?.lastActivityAt?.toISOString() || null,
      pathsProgress,
    };

    return {
      progress,
    };
  }
}
