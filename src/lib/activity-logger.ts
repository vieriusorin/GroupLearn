/**
 * Activity Logger Utility
 *
 * Logs user activities for analytics and progress tracking.
 * All activities are stored with timestamps and optional group context.
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  dailyStreaks,
  groupMemberAnalytics,
  userActivityLog,
  userProgress,
} from "@/infrastructure/database/schema";
import {
  ActivityType as DbActivityType,
  type ActivityTypeType,
} from "@/infrastructure/database/schema/enums";

export type ActivityType = ActivityTypeType;

export interface ActivityDetails {
  lessonId?: number;
  pathId?: number;
  unitId?: number;
  flashcardId?: number;
  categoryId?: number;
  correct?: boolean;
  timeSpent?: number; // seconds
  score?: number;
  difficulty?: string;
  [key: string]: any;
}

/**
 * Log a user activity
 */
export async function logActivity(
  userId: string,
  activityType: ActivityType,
  details?: ActivityDetails,
  groupId?: number | null,
): Promise<number> {
  const [result] = await db
    .insert(userActivityLog)
    .values({
      userId,
      groupId: groupId || null,
      activityType,
      activityDetails: details ? JSON.stringify(details) : null,
    })
    .returning({ id: userActivityLog.id });

  return result.id;
}

/**
 * Log lesson start
 */
export async function logLessonStart(
  userId: string,
  lessonId: number,
  pathId: number,
  unitId: number,
  groupId?: number | null,
): Promise<number> {
  return logActivity(
    userId,
    DbActivityType.LESSON_STARTED,
    { lessonId, pathId, unitId },
    groupId,
  );
}

/**
 * Log lesson completion
 */
export async function logLessonComplete(
  userId: string,
  lessonId: number,
  pathId: number,
  unitId: number,
  timeSpent: number,
  score?: number,
  groupId?: number | null,
): Promise<number> {
  const activityId = await logActivity(
    userId,
    DbActivityType.LESSON_COMPLETED,
    { lessonId, pathId, unitId, timeSpent, score },
    groupId,
  );

  // Update user progress with completion timestamp
  await updateProgressCompletion(userId, pathId, timeSpent, groupId);

  // Update group member analytics if in group context
  if (groupId) {
    await updateGroupMemberAnalytics(userId, groupId);
  }

  // Update daily streak
  await updateDailyStreak(userId);

  return activityId;
}

/**
 * Log flashcard view
 */
export async function logFlashcardView(
  userId: string,
  flashcardId: number,
  categoryId: number,
  groupId?: number | null,
): Promise<number> {
  return logActivity(
    userId,
    DbActivityType.FLASHCARD_REVIEWED,
    { flashcardId, categoryId },
    groupId,
  );
}

/**
 * Log flashcard answer
 */
export async function logFlashcardAnswer(
  userId: string,
  flashcardId: number,
  categoryId: number,
  correct: boolean,
  timeSpent: number,
  difficulty: string,
  groupId?: number | null,
): Promise<number> {
  const activityId = await logActivity(
    userId,
    DbActivityType.FLASHCARD_REVIEWED,
    { flashcardId, categoryId, correct, timeSpent, difficulty },
    groupId,
  );

  // Update group member analytics if in group context
  if (groupId) {
    await updateGroupMemberAnalytics(userId, groupId);
  }

  return activityId;
}

/**
 * Log path start
 */
export async function logPathStart(
  userId: string,
  pathId: number,
  groupId?: number | null,
): Promise<number> {
  return logActivity(userId, DbActivityType.PATH_STARTED, { pathId }, groupId);
}

/**
 * Log path completion
 */
export async function logPathComplete(
  userId: string,
  pathId: number,
  totalTimeSpent: number,
  groupId?: number | null,
): Promise<number> {
  return logActivity(
    userId,
    DbActivityType.PATH_COMPLETED,
    { pathId, timeSpent: totalTimeSpent },
    groupId,
  );
}

/**
 * Update user progress with completion timestamp and time spent
 */
async function updateProgressCompletion(
  userId: string,
  pathId: number,
  timeSpent: number,
  _groupId?: number | null,
): Promise<void> {
  // Get existing progress for this path
  const [progress] = await db
    .select()
    .from(userProgress)
    .where(
      and(eq(userProgress.userId, userId), eq(userProgress.pathId, pathId)),
    )
    .limit(1);

  if (progress) {
    // Update existing progress
    const totalTime = (progress.timeSpentTotal || 0) + timeSpent;
    await db
      .update(userProgress)
      .set({
        timeSpentTotal: totalTime,
        lastActivityDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userProgress.id, progress.id));
  }
  // Note: Creating new progress should happen when starting a path, not here
}

/**
 * Update group member analytics (cached stats)
 */
async function updateGroupMemberAnalytics(
  userId: string,
  groupId: number,
): Promise<void> {
  // Get total lessons completed
  const [lessonsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.userId, userId),
        eq(userActivityLog.groupId, groupId),
        eq(userActivityLog.activityType, DbActivityType.LESSON_COMPLETED),
      ),
    );

  // Get total flashcards reviewed
  const [flashcardsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.userId, userId),
        eq(userActivityLog.groupId, groupId),
        eq(userActivityLog.activityType, DbActivityType.FLASHCARD_REVIEWED),
      ),
    );

  // Get total time spent (extract from JSON)
  const [timeResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM((activity_details->>'timeSpent')::integer), 0)`,
    })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.userId, userId),
        eq(userActivityLog.groupId, groupId),
        sql`activity_type IN ('lesson_completed', 'flashcard_reviewed')`,
        sql`activity_details->>'timeSpent' IS NOT NULL`,
      ),
    );

  // Get average score from completed lessons
  const [scoreResult] = await db
    .select({
      avg: sql<number>`AVG((activity_details->>'score')::real)`,
    })
    .from(userActivityLog)
    .where(
      and(
        eq(userActivityLog.userId, userId),
        eq(userActivityLog.groupId, groupId),
        eq(userActivityLog.activityType, DbActivityType.LESSON_COMPLETED),
        sql`activity_details->>'score' IS NOT NULL`,
      ),
    );

  // Upsert analytics record
  await db
    .insert(groupMemberAnalytics)
    .values({
      groupId,
      userId,
      totalLessonsCompleted: Number(lessonsResult.count) || 0,
      totalFlashcardsReviewed: Number(flashcardsResult.count) || 0,
      totalTimeSpent: timeResult.total || 0,
      averageScore: scoreResult.avg || 0,
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [groupMemberAnalytics.groupId, groupMemberAnalytics.userId],
      set: {
        totalLessonsCompleted: sql`excluded.total_lessons_completed`,
        totalFlashcardsReviewed: sql`excluded.total_flashcards_reviewed`,
        totalTimeSpent: sql`excluded.total_time_spent`,
        averageScore: sql`excluded.average_score`,
        lastActivityAt: sql`excluded.last_activity_at`,
        updatedAt: sql`excluded.updated_at`,
      },
    });
}

/**
 * Update daily streak for user
 */
async function updateDailyStreak(userId: string): Promise<void> {
  const now = new Date();
  const today = now.toISOString().split("T")[0]; // YYYY-MM-DD

  // Get current streak record
  const [streak] = await db
    .select()
    .from(dailyStreaks)
    .where(eq(dailyStreaks.userId, userId))
    .limit(1);

  if (!streak) {
    // Create new streak
    await db.insert(dailyStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: new Date(today),
      updatedAt: new Date(),
    });

    await logActivity(userId, DbActivityType.STREAK_ACHIEVED, { streak: 1 });
  } else {
    const lastDate = streak.lastActivityDate
      ? streak.lastActivityDate.toISOString().split("T")[0]
      : null;

    if (lastDate === today) {
      // Already counted today, no update needed
      return;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = streak.currentStreak || 0;

    if (lastDate === yesterdayStr) {
      // Consecutive day, increment streak
      newStreak = (streak.currentStreak || 0) + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, streak.longestStreak || 0);

    await db
      .update(dailyStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastActivityDate: new Date(today),
        updatedAt: new Date(),
      })
      .where(eq(dailyStreaks.id, streak.id));

    await logActivity(userId, DbActivityType.STREAK_ACHIEVED, {
      streak: newStreak,
    });
  }
}

/**
 * Get user's recent activity
 */
export async function getUserRecentActivity(
  userId: string,
  limit: number = 50,
): Promise<
  Array<{
    id: number;
    activityType: string;
    activityDetails: string | null;
    createdAt: Date;
    groupId: number | null;
  }>
> {
  return db
    .select({
      id: userActivityLog.id,
      activityType: userActivityLog.activityType,
      activityDetails: userActivityLog.activityDetails,
      createdAt: userActivityLog.createdAt,
      groupId: userActivityLog.groupId,
    })
    .from(userActivityLog)
    .where(eq(userActivityLog.userId, userId))
    .orderBy(desc(userActivityLog.createdAt))
    .limit(limit);
}

/**
 * Get user's daily streak
 */
export async function getUserStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
} | null> {
  const [streak] = await db
    .select({
      currentStreak: dailyStreaks.currentStreak,
      longestStreak: dailyStreaks.longestStreak,
      lastActivityDate: dailyStreaks.lastActivityDate,
    })
    .from(dailyStreaks)
    .where(eq(dailyStreaks.userId, userId))
    .limit(1);

  if (!streak) {
    return null;
  }

  return {
    currentStreak: streak.currentStreak ?? 0,
    longestStreak: streak.longestStreak ?? 0,
    lastActivityDate: streak.lastActivityDate,
  };
}

/**
 * Get group activity feed
 */
export async function getGroupActivity(
  groupId: number,
  limit: number = 100,
): Promise<
  Array<{
    id: number;
    userId: string;
    activityType: string;
    activityDetails: string | null;
    createdAt: Date;
  }>
> {
  return db
    .select({
      id: userActivityLog.id,
      userId: userActivityLog.userId,
      activityType: userActivityLog.activityType,
      activityDetails: userActivityLog.activityDetails,
      createdAt: userActivityLog.createdAt,
    })
    .from(userActivityLog)
    .where(eq(userActivityLog.groupId, groupId))
    .orderBy(desc(userActivityLog.createdAt))
    .limit(limit);
}
