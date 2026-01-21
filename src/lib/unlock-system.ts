/**
 * Unlock System Logic
 *
 * This module handles the lock/unlock mechanics for:
 * - Lessons (unlock when previous lesson completed)
 * - Units (unlock when all previous unit lessons completed)
 * - Paths (unlock based on requirements)
 */

import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  lessonCompletions,
  lessons,
  paths,
  units,
  userProgress,
} from "@/infrastructure/database/schema";
import type { Lesson } from "./types";

// ===== LESSON UNLOCK LOGIC =====

/**
 * Check if a lesson is unlocked
 * Rules:
 * - First lesson in first unit is always unlocked
 * - Other lessons unlock when previous lesson is completed
 */
export async function isLessonUnlocked(
  lessonId: number,
  userId: string,
): Promise<boolean> {
  // Get lesson info with unit context
  const [lesson] = await db
    .select({
      id: lessons.id,
      unitId: lessons.unitId,
      orderIndex: lessons.orderIndex,
      unitNumber: units.unitNumber,
      pathId: units.pathId,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) return false;

  // First lesson in first unit is always unlocked
  if (lesson.unitNumber === 1 && lesson.orderIndex === 0) {
    return true;
  }

  // Check if previous lesson in this unit is completed
  if (lesson.orderIndex > 0) {
    const [prevLesson] = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(
        and(
          eq(lessons.unitId, lesson.unitId),
          eq(lessons.orderIndex, lesson.orderIndex - 1),
        ),
      )
      .limit(1);

    if (prevLesson) {
      return await isLessonCompleted(prevLesson.id, userId);
    }
    // If previous lesson doesn't exist, lesson should be locked
    return false;
  }

  // If this is first lesson in non-first unit, check if previous unit is complete
  if (lesson.orderIndex === 0 && lesson.unitNumber > 1) {
    const [prevUnit] = await db
      .select({ id: units.id })
      .from(units)
      .where(
        and(
          eq(units.pathId, lesson.pathId),
          eq(units.unitNumber, lesson.unitNumber - 1),
        ),
      )
      .limit(1);

    if (prevUnit) {
      return await isUnitCompleted(prevUnit.id, userId);
    }
    // If previous unit doesn't exist, lesson should be locked
    return false;
  }

  // Should not reach here, but return false as safe default
  return false;
}

/**
 * Check if a lesson has been completed at least once by the user
 */
export async function isLessonCompleted(
  lessonId: number,
  userId: string,
): Promise<boolean> {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(lessonCompletions)
    .where(
      and(
        eq(lessonCompletions.lessonId, lessonId),
        eq(lessonCompletions.userId, userId),
      ),
    );

  return Number(result.count) > 0;
}

// ===== UNIT UNLOCK LOGIC =====

/**
 * Check if a unit is unlocked
 * Rules:
 * - First unit is always unlocked
 * - Other units unlock when all lessons in previous unit are completed
 */
export async function isUnitUnlocked(
  unitId: number,
  userId: string,
): Promise<boolean> {
  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.id, unitId))
    .limit(1);

  if (!unit) return false;

  // First unit is always unlocked
  if (unit.unitNumber === 1) return true;

  // Check if all lessons in previous unit are completed
  const [prevUnit] = await db
    .select({ id: units.id })
    .from(units)
    .where(
      and(
        eq(units.pathId, unit.pathId),
        eq(units.unitNumber, unit.unitNumber - 1),
      ),
    )
    .limit(1);

  if (!prevUnit) return true; // No previous unit, unlock

  return await isUnitCompleted(prevUnit.id, userId);
}

/**
 * Check if all lessons in a unit are completed by the user
 */
export async function isUnitCompleted(
  unitId: number,
  userId: string,
): Promise<boolean> {
  const [result] = await db
    .select({
      totalLessons: sql<number>`COUNT(${lessons.id})`,
      completedLessons: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
    })
    .from(lessons)
    .leftJoin(
      lessonCompletions,
      and(
        eq(lessons.id, lessonCompletions.lessonId),
        eq(lessonCompletions.userId, userId),
      ),
    )
    .where(eq(lessons.unitId, unitId));

  const totalLessons = Number(result.totalLessons) || 0;
  const completedLessons = Number(result.completedLessons) || 0;

  return totalLessons > 0 && totalLessons === completedLessons;
}

// ===== PATH UNLOCK LOGIC =====

/**
 * Check if a path is unlocked
 * Rules:
 * - If unlock_requirement_type is 'none': always unlocked
 * - If 'previous_path': requires previous path completion
 * - If 'xp_threshold': requires total_xp >= unlock_requirement_value
 */
export async function isPathUnlocked(
  pathId: number,
  userId: string,
): Promise<boolean> {
  const [path] = await db
    .select()
    .from(paths)
    .where(eq(paths.id, pathId))
    .limit(1);

  if (!path) return false;

  // Path is explicitly locked
  if (path.isLocked) return false;

  // No unlock requirement, always unlocked
  if (!path.unlockRequirementType || path.unlockRequirementType === "none") {
    return true;
  }

  // Previous path requirement
  if (path.unlockRequirementType === "previous_path") {
    if (!path.unlockRequirementValue) return true;

    const [prevPath] = await db
      .select({ id: paths.id })
      .from(paths)
      .where(eq(paths.id, path.unlockRequirementValue))
      .limit(1);

    if (!prevPath) return true; // Previous path doesn't exist, unlock

    return await isPathCompleted(prevPath.id, userId);
  }

  // XP threshold requirement
  if (path.unlockRequirementType === "xp_threshold") {
    if (!path.unlockRequirementValue) return true;

    const [progress] = await db
      .select({ totalXp: userProgress.totalXp })
      .from(userProgress)
      .where(
        and(eq(userProgress.pathId, pathId), eq(userProgress.userId, userId)),
      )
      .limit(1);

    const totalXP = progress?.totalXp || 0;
    return totalXP >= path.unlockRequirementValue;
  }

  return true;
}

/**
 * Check if all units in a path are completed by the user
 */
export async function isPathCompleted(
  pathId: number,
  userId: string,
): Promise<boolean> {
  const unitsInPath = await db
    .select({ id: units.id })
    .from(units)
    .where(eq(units.pathId, pathId));

  if (unitsInPath.length === 0) return false;

  // Check if all units are completed
  for (const unit of unitsInPath) {
    if (!(await isUnitCompleted(unit.id, userId))) {
      return false;
    }
  }

  return true;
}

// ===== NEXT LESSON LOGIC =====

/**
 * Get the next unlocked lesson for a path
 * Returns null if all lessons are completed
 */
export async function getNextLesson(
  pathId: number,
  userId: string,
): Promise<Lesson | null> {
  // Get all lessons in path ordered by unit then lesson order
  const allLessons = await db
    .select({
      id: lessons.id,
      unitId: lessons.unitId,
      name: lessons.name,
      description: lessons.description,
      orderIndex: lessons.orderIndex,
      xpReward: lessons.xpReward,
      flashcardCount: lessons.flashcardCount,
      createdAt: lessons.createdAt,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(eq(units.pathId, pathId))
    .orderBy(asc(units.unitNumber), asc(lessons.orderIndex));

  // Find first lesson that is unlocked and not completed
  for (const lesson of allLessons) {
    const [completed, unlocked] = await Promise.all([
      isLessonCompleted(lesson.id, userId),
      isLessonUnlocked(lesson.id, userId),
    ]);

    if (!completed && unlocked) {
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
  }

  return null; // All lessons completed
}

/**
 * Get the next lesson in sequence after completing a lesson
 */
export async function getNextLessonAfterCompletion(
  completedLessonId: number,
): Promise<Lesson | null> {
  // Get the completed lesson info
  const [completedLesson] = await db
    .select({
      id: lessons.id,
      unitId: lessons.unitId,
      orderIndex: lessons.orderIndex,
      pathId: units.pathId,
      unitNumber: units.unitNumber,
    })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(eq(lessons.id, completedLessonId))
    .limit(1);

  if (!completedLesson) return null;

  // Try to get next lesson in same unit
  const [nextInUnit] = await db
    .select()
    .from(lessons)
    .where(
      and(
        eq(lessons.unitId, completedLesson.unitId),
        eq(lessons.orderIndex, completedLesson.orderIndex + 1),
      ),
    )
    .limit(1);

  if (nextInUnit) {
    return {
      id: nextInUnit.id,
      unit_id: nextInUnit.unitId,
      name: nextInUnit.name,
      description: nextInUnit.description,
      order_index: nextInUnit.orderIndex,
      xp_reward: nextInUnit.xpReward,
      flashcard_count: nextInUnit.flashcardCount,
      created_at: nextInUnit.createdAt.toISOString(),
    };
  }

  // No more lessons in this unit, try first lesson of next unit
  const [nextUnit] = await db
    .select({ id: units.id })
    .from(units)
    .where(
      and(
        eq(units.pathId, completedLesson.pathId),
        eq(units.unitNumber, completedLesson.unitNumber + 1),
      ),
    )
    .limit(1);

  if (nextUnit) {
    const [firstLessonNextUnit] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.unitId, nextUnit.id))
      .orderBy(asc(lessons.orderIndex))
      .limit(1);

    if (firstLessonNextUnit) {
      return {
        id: firstLessonNextUnit.id,
        unit_id: firstLessonNextUnit.unitId,
        name: firstLessonNextUnit.name,
        description: firstLessonNextUnit.description,
        order_index: firstLessonNextUnit.orderIndex,
        xp_reward: firstLessonNextUnit.xpReward,
        flashcard_count: firstLessonNextUnit.flashcardCount,
        created_at: firstLessonNextUnit.createdAt.toISOString(),
      };
    }
  }

  return null; // Path completed
}
