/**
 * CONVERTED CRITICAL FUNCTIONS FOR db-operations-paths.ts
 *
 * This file contains Drizzle ORM versions of the most actively used functions.
 * These should replace the SQLite3 versions in db-operations-paths.ts
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessonCompletions,
  lessons,
  pathApprovals,
  paths,
  units,
  xpTransactions,
} from "@/infrastructure/database/schema";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { calculateDifficultyFromUnit } from "./gamification";
import type {
  Lesson,
  LessonWithProgress,
  Path,
  PathApproval,
  Unit,
  UnitWithProgress,
  XPTransaction,
} from "./types";
import {
  isLessonCompleted,
  isLessonUnlocked,
  isUnitUnlocked,
} from "./unlock-system";

// ===== PATH OPERATIONS =====

export async function getPathById(id: number): Promise<Path | undefined> {
  const [path] = await db.select().from(paths).where(eq(paths.id, id)).limit(1);

  if (!path) {
    return undefined;
  }

  return {
    id: path.id,
    domain_id: path.domainId,
    name: path.name,
    description: path.description,
    icon: path.icon,
    order_index: path.orderIndex,
    is_locked: path.isLocked,
    unlock_requirement_type:
      (path.unlockRequirementType as Path["unlock_requirement_type"]) ?? null,
    unlock_requirement_value: path.unlockRequirementValue ?? null,
    visibility: path.visibility as Path["visibility"],
    created_by: path.createdBy ?? null,
    created_at: path.createdAt.toISOString(),
  };
}

// ===== PATH APPROVAL OPERATIONS =====

export async function approveUserForPath(
  pathId: number,
  userId: string,
  approvedBy: string,
): Promise<PathApproval> {
  // Check if path is private
  const [path] = await db
    .select({ visibility: paths.visibility })
    .from(paths)
    .where(eq(paths.id, pathId))
    .limit(1);

  if (!path) {
    throw new Error("Path not found");
  }
  if (path.visibility !== "private") {
    throw new Error("Only private paths require approval");
  }

  // Insert or update approval
  const [approval] = await db
    .insert(pathApprovals)
    .values({
      pathId,
      userId,
      approvedBy,
      approvedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [pathApprovals.pathId, pathApprovals.userId],
      set: {
        approvedBy,
        approvedAt: new Date(),
      },
    })
    .returning();

  return {
    id: approval.id,
    path_id: approval.pathId,
    user_id: approval.userId,
    approved_by: approval.approvedBy,
    approved_at: approval.approvedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function removePathApproval(
  pathId: number,
  userId: string,
): Promise<void> {
  await db
    .delete(pathApprovals)
    .where(
      and(eq(pathApprovals.pathId, pathId), eq(pathApprovals.userId, userId)),
    );
}

// ===== UNIT OPERATIONS =====

export async function getUnitById(id: number): Promise<Unit | undefined> {
  const [unit] = await db.select().from(units).where(eq(units.id, id)).limit(1);

  if (!unit) return undefined;

  return {
    id: unit.id,
    path_id: unit.pathId,
    name: unit.name,
    description: unit.description,
    unit_number: unit.unitNumber,
    order_index: unit.orderIndex,
    xp_reward: unit.xpReward,
    created_at: unit.createdAt.toISOString(),
  };
}

// ===== LESSON OPERATIONS =====

export async function getLessonById(id: number): Promise<Lesson | undefined> {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);

  if (!lesson) return undefined;

  return {
    id: lesson.id,
    unit_id: lesson.unitId,
    name: lesson.name,
    description: lesson.description,
    order_index: lesson.orderIndex,
    xp_reward: lesson.xpReward,
    flashcard_count: lesson.flashcardCount,
    created_at: lesson.createdAt.toISOString(),
  };
}

// ===== XP TRANSACTION OPERATIONS =====

export async function getXPHistory(
  pathId: number,
  limit: number = 50,
): Promise<XPTransaction[]> {
  const transactions = await db
    .select()
    .from(xpTransactions)
    .where(eq(xpTransactions.pathId, pathId))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(limit);

  return transactions.map((t) => ({
    id: t.id,
    user_id: t.userId,
    path_id: t.pathId,
    amount: t.amount,
    source_type: t.sourceType,
    source_id: t.sourceId,
    created_at: t.createdAt.toISOString(),
  }));
}

export async function getTotalXP(pathId: number): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`SUM(${xpTransactions.amount})` })
    .from(xpTransactions)
    .where(eq(xpTransactions.pathId, pathId));

  return Number(result.total) || 0;
}

// Cached versions of XP functions
export const getCachedXPHistory = unstable_cache(getXPHistory, ["xp-history"], {
  tags: [CACHE_TAGS.paths],
});

export const getCachedTotalXP = unstable_cache(getTotalXP, ["total-xp"], {
  tags: [CACHE_TAGS.paths],
});

// ===== HELPER FUNCTIONS =====

export async function getBestLessonAccuracy(
  lessonId: number,
  userId: string,
): Promise<number | null> {
  const [result] = await db
    .select({ best: sql<number>`MAX(${lessonCompletions.accuracyPercent})` })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.lessonId, lessonId),
        eq(lessonCompletions.userId, userId),
      ),
    );

  return result.best;
}

export async function getLessonCompletionCount(
  lessonId: number,
  userId: string,
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.lessonId, lessonId),
        eq(lessonCompletions.userId, userId),
      ),
    );

  return Number(result.count) || 0;
}

// ===== PROGRESS FUNCTIONS =====

export async function getUnitsWithProgress(
  pathId: number,
  userId: string,
): Promise<UnitWithProgress[]> {
  const unitsList = await db
    .select()
    .from(units)
    .where(eq(units.pathId, pathId))
    .orderBy(units.orderIndex);

  const unitsWithProgress: UnitWithProgress[] = await Promise.all(
    unitsList.map(async (unit) => {
      const difficulty = calculateDifficultyFromUnit(unit.unitNumber);

      // Get lesson count
      const [counts] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(lessons)
        .where(eq(lessons.unitId, unit.id));

      // Get completed lesson count
      const [completed] = await db
        .select({
          completed: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
        })
        .from(lessonCompletions)
        .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
        .where(
          and(
            eq(lessons.unitId, unit.id),
            eq(lessonCompletions.userId, userId),
          ),
        );

      const totalLessons = Number(counts.total) || 0;
      const completedLessons = Number(completed.completed) || 0;
      const completionPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        id: unit.id,
        path_id: unit.pathId,
        name: unit.name,
        description: unit.description,
        unit_number: unit.unitNumber,
        order_index: unit.orderIndex,
        xp_reward: unit.xpReward,
        created_at: unit.createdAt.toISOString(),
        difficulty,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        completion_percent: completionPercent,
        is_unlocked: await isUnitUnlocked(unit.id, userId),
      };
    }),
  );

  return unitsWithProgress;
}

export async function getLessonsWithProgress(
  unitId: number,
  userId: string,
): Promise<LessonWithProgress[]> {
  const lessonsList = await db
    .select()
    .from(lessons)
    .where(eq(lessons.unitId, unitId))
    .orderBy(lessons.orderIndex);

  const lessonsWithProgress: LessonWithProgress[] = await Promise.all(
    lessonsList.map(async (lesson) => {
      const bestAccuracy = await getBestLessonAccuracy(lesson.id, userId);
      const completionCount = await getLessonCompletionCount(lesson.id, userId);

      return {
        id: lesson.id,
        unit_id: lesson.unitId,
        name: lesson.name,
        description: lesson.description,
        order_index: lesson.orderIndex,
        xp_reward: lesson.xpReward,
        flashcard_count: lesson.flashcardCount,
        created_at: lesson.createdAt.toISOString(),
        is_completed: await isLessonCompleted(lesson.id, userId),
        is_unlocked: await isLessonUnlocked(lesson.id, userId),
        best_accuracy: bestAccuracy,
        completion_count: completionCount,
        times_failed: 0,
      };
    }),
  );

  return lessonsWithProgress;
}

export const getCachedUnitsWithProgress = unstable_cache(
  getUnitsWithProgress,
  ["units-with-progress"],
  {
    tags: [CACHE_TAGS.paths],
  },
);

export const getCachedLessonsWithProgress = unstable_cache(
  getLessonsWithProgress,
  ["lessons-with-progress"],
  {
    tags: [CACHE_TAGS.paths],
  },
);
