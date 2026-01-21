/**
 * Analytics Calculations Library
 *
 * Provides functions for calculating group analytics, member progress,
 * and generating reports for admin dashboards.
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  dailyStreaks,
  groupMemberAnalytics,
  groupMembers,
  groupPaths,
  groupPathVisibility,
  groups,
  lessonCompletions,
  lessons,
  paths,
  units,
  userActivityLog,
  userProgress,
  users,
} from "@/infrastructure/database/schema";
import { ActivityType } from "@/infrastructure/database/schema/enums";

export interface GroupAnalytics {
  groupId: number;
  groupName: string;
  memberCount: number;
  totalPathsAssigned: number;
  totalLessonsCompleted: number;
  totalFlashcardsReviewed: number;
  totalTimeSpent: number; // seconds
  averageScore: number;
  activeMembers: number; // active in last 7 days
  completionRate: number; // percentage of assigned lessons completed
}

export interface MemberProgress {
  userId: string;
  userName: string;
  userEmail: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  completionRate: number;
  flashcardsReviewed: number;
  totalTimeSpent: number;
  averageScore: number;
  currentStreak: number;
  lastActivityAt: string | null;
  pathsProgress: PathProgress[];
}

export interface PathProgress {
  pathId: number;
  pathName: string;
  unitsCompleted: number;
  unitsTotal: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  completionRate: number;
  timeSpent: number;
  averageScore: number;
}

export interface PathAnalytics {
  pathId: number;
  pathName: string;
  totalMembers: number;
  membersStarted: number;
  membersCompleted: number;
  averageCompletionTime: number; // seconds
  averageScore: number;
  completionRate: number;
  unitAnalytics: UnitAnalytics[];
}

export interface UnitAnalytics {
  unitId: number;
  unitName: string;
  lessonsTotal: number;
  averageCompletion: number;
  averageScore: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  lessonsCompleted: number;
  timeSpent: number;
  streak: number;
  rank: number;
}

/**
 * Get comprehensive group analytics
 */
export async function getGroupAnalytics(
  groupId: number,
): Promise<GroupAnalytics> {
  // Get basic group info
  const [group] = await db
    .select({ id: groups.id, name: groups.name })
    .from(groups)
    .where(eq(groups.id, groupId))
    .limit(1);

  if (!group) {
    throw new Error("Group not found");
  }

  // Get member count
  const [memberCountResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  // Get assigned paths count
  const [pathsCountResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(groupPaths)
    .where(eq(groupPaths.groupId, groupId));

  // Get analytics from cached table
  const [analyticsResult] = await db
    .select({
      lessons: sql<number>`SUM(${groupMemberAnalytics.totalLessonsCompleted})`,
      flashcards: sql<number>`SUM(${groupMemberAnalytics.totalFlashcardsReviewed})`,
      time: sql<number>`SUM(${groupMemberAnalytics.totalTimeSpent})`,
      score: sql<number>`AVG(${groupMemberAnalytics.averageScore})`,
    })
    .from(groupMemberAnalytics)
    .where(eq(groupMemberAnalytics.groupId, groupId));

  // Get active members (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const [activeMembersResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${userActivityLog.userId})` })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.groupId, groupId),
        sql`${userActivityLog.createdAt} >= ${sevenDaysAgo.toISOString()}`,
      ),
    );

  // Calculate completion rate
  const [assignedLessonsResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${lessons.id})` })
    .from(groupPaths)
    .innerJoin(units, eq(units.pathId, groupPaths.pathId))
    .innerJoin(lessons, eq(lessons.unitId, units.id))
    .where(eq(groupPaths.groupId, groupId));

  const memberCount = Number(memberCountResult.count) || 0;
  const lessonsCompleted = Number(analyticsResult.lessons) || 0;
  const assignedLessonsCount = Number(assignedLessonsResult.count) || 0;

  const completionRate =
    assignedLessonsCount > 0 && memberCount > 0
      ? (lessonsCompleted / (assignedLessonsCount * memberCount)) * 100
      : 0;

  return {
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
}

/**
 * Get detailed member progress within a group
 */
export async function getMemberProgress(
  userId: string,
  groupId: number,
): Promise<MemberProgress> {
  // Get user info
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new Error("User not found");
  }

  // Get cached analytics
  const [analyticsData] = await db
    .select()
    .from(groupMemberAnalytics)
    .where(
      and(
        eq(groupMemberAnalytics.userId, userId),
        eq(groupMemberAnalytics.groupId, groupId),
      ),
    )
    .limit(1);

  // Get total available lessons in group
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
        eq(groupPaths.groupId, groupId),
        sql`COALESCE(${groupPathVisibility.isVisible}, true) = true`,
      ),
    );

  // Get user's streak
  const [streakData] = await db
    .select({ currentStreak: dailyStreaks.currentStreak })
    .from(dailyStreaks)
    .where(eq(dailyStreaks.userId, userId))
    .limit(1);

  // Get path-level progress
  const pathsProgress = await getPathsProgressForMember(userId, groupId);

  const lessonsCompleted = analyticsData?.totalLessonsCompleted || 0;
  const totalLessonsCount = Number(totalLessonsResult.count) || 0;
  const completionRate =
    totalLessonsCount > 0 ? (lessonsCompleted / totalLessonsCount) * 100 : 0;

  return {
    userId: user.id,
    userName: user.name ?? "",
    userEmail: user.email,
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
}

/**
 * Get path progress details for a member
 */
async function getPathsProgressForMember(
  userId: string,
  groupId: number,
): Promise<PathProgress[]> {
  // Get assigned paths
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
      // Get units for this path
      const [unitsTotalResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(units)
        .where(eq(units.pathId, path.id));

      // Get lessons for this path
      const [lessonsTotalResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${lessons.id})` })
        .from(units)
        .innerJoin(lessons, eq(lessons.unitId, units.id))
        .where(eq(units.pathId, path.id));

      // Get completed lessons by user (based on lesson completions history)
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

      // Get completed units (all lessons in unit completed for this user)
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

      // Get time spent on this path
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

      // Get average score (activity_details is stored as JSON string)
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

/**
 * Get path analytics for a group
 */
export async function getPathAnalytics(
  pathId: number,
  groupId: number,
): Promise<PathAnalytics> {
  // Get path info
  const [path] = await db
    .select({ id: paths.id, name: paths.name })
    .from(paths)
    .where(eq(paths.id, pathId))
    .limit(1);

  if (!path) {
    throw new Error("Path not found");
  }

  // Get total group members
  const [totalMembersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  // Get members who started this path
  const [membersStartedResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${userActivityLog.userId})` })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.groupId, groupId),
        sql`${userActivityLog.activityType} IN ('path_start', 'lesson_start', 'lesson_complete')`,
        sql`${userActivityLog.activityDetails}->>'pathId' = ${pathId.toString()}`,
      ),
    );

  // Get members who completed this path
  const [membersCompletedResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${userActivityLog.userId})` })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.groupId, groupId),
        eq(userActivityLog.activityType, ActivityType.PATH_COMPLETED),
        sql`${userActivityLog.activityDetails}->>'pathId' = ${pathId.toString()}`,
      ),
    );

  // Get average completion time
  const [avgTimeResult] = await db
    .select({
      avg: sql<number>`AVG(CAST(${userActivityLog.activityDetails}->>'timeSpent' AS INTEGER))`,
    })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.groupId, groupId),
        eq(userActivityLog.activityType, ActivityType.PATH_COMPLETED),
        sql`${userActivityLog.activityDetails}->>'pathId' = ${pathId.toString()}`,
      ),
    );

  // Get average score
  const [avgScoreResult] = await db
    .select({
      avg: sql<number>`AVG(CAST(${userActivityLog.activityDetails}->>'score' AS REAL))`,
    })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.groupId, groupId),
        eq(userActivityLog.activityType, ActivityType.LESSON_COMPLETED),
        sql`${userActivityLog.activityDetails}->>'pathId' = ${pathId.toString()}`,
        sql`${userActivityLog.activityDetails}->>'score' IS NOT NULL`,
      ),
    );

  // Get unit analytics
  const unitAnalytics = await getUnitAnalyticsForPath(pathId, groupId);

  const totalMembersCount = Number(totalMembersResult.count) || 0;
  const membersCompletedCount = Number(membersCompletedResult.count) || 0;
  const completionRate =
    totalMembersCount > 0
      ? (membersCompletedCount / totalMembersCount) * 100
      : 0;

  return {
    pathId: path.id,
    pathName: path.name,
    totalMembers: totalMembersCount,
    membersStarted: Number(membersStartedResult.count) || 0,
    membersCompleted: membersCompletedCount,
    averageCompletionTime: Math.round(Number(avgTimeResult.avg) || 0),
    averageScore: Math.round((Number(avgScoreResult.avg) || 0) * 10) / 10,
    completionRate: Math.round(completionRate * 10) / 10,
    unitAnalytics,
  };
}

/**
 * Get unit analytics for a path
 */
async function getUnitAnalyticsForPath(
  pathId: number,
  groupId: number,
): Promise<UnitAnalytics[]> {
  const unitsList = await db
    .select({ id: units.id, name: units.name })
    .from(units)
    .where(eq(units.pathId, pathId))
    .orderBy(asc(units.orderIndex));

  const [totalMembersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  const totalMembersCount = Number(totalMembersResult.count) || 0;

  const unitAnalytics = await Promise.all(
    unitsList.map(async (unit) => {
      // Get total lessons in unit
      const [lessonsTotalResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(lessons)
        .where(eq(lessons.unitId, unit.id));

      // Get average completion (how many members completed lessons in this unit)
      const [completedCountResult] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${userActivityLog.userId})`,
        })
        .from(userActivityLog)
        .where(
          and(
            eq(userActivityLog.groupId, groupId),
            eq(userActivityLog.activityType, ActivityType.LESSON_COMPLETED),
            sql`${userActivityLog.activityDetails}->>'unitId' = ${unit.id.toString()}`,
          ),
        );

      // Get average score for this unit
      const [avgScoreResult] = await db
        .select({
          avg: sql<number>`AVG(CAST(${userActivityLog.activityDetails}->>'score' AS REAL))`,
        })
        .from(userActivityLog)
        .where(
          and(
            eq(userActivityLog.groupId, groupId),
            eq(userActivityLog.activityType, ActivityType.LESSON_COMPLETED),
            sql`${userActivityLog.activityDetails}->>'unitId' = ${unit.id.toString()}`,
            sql`${userActivityLog.activityDetails}->>'score' IS NOT NULL`,
          ),
        );

      const completedCount = Number(completedCountResult.count) || 0;
      const avgCompletion =
        totalMembersCount > 0 ? (completedCount / totalMembersCount) * 100 : 0;

      return {
        unitId: unit.id,
        unitName: unit.name,
        lessonsTotal: Number(lessonsTotalResult.count) || 0,
        averageCompletion: Math.round(avgCompletion * 10) / 10,
        averageScore: Math.round((Number(avgScoreResult.avg) || 0) * 10) / 10,
      };
    }),
  );

  return unitAnalytics;
}

/**
 * Get group leaderboard
 */
export async function getGroupLeaderboard(
  groupId: number,
  limit: number = 10,
): Promise<LeaderboardEntry[]> {
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
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(
      desc(sql`COALESCE(${groupMemberAnalytics.averageScore}, 0) * 10`),
      desc(sql`COALESCE(${groupMemberAnalytics.totalLessonsCompleted}, 0)`),
      asc(sql`COALESCE(${groupMemberAnalytics.totalTimeSpent}, 0)`),
    )
    .limit(limit);

  return entries.map((entry, index) => ({
    userId: entry.userId,
    userName: entry.userName ?? "",
    score: Math.round(Number(entry.score)),
    lessonsCompleted: Number(entry.lessonsCompleted),
    timeSpent: Number(entry.timeSpent),
    streak: Number(entry.streak),
    rank: index + 1,
  }));
}
