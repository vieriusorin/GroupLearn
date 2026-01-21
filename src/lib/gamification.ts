/**
 * Gamification Logic: XP and Hearts System
 *
 * This module handles all game mechanics calculations:
 * - XP earning and calculation
 * - Hearts management and refills
 * - Difficulty-based rewards
 */

import { calculateStreak, getUTCDateString } from "./streak-utils-pure";
import type { Difficulty } from "./types";

// ===== XP SYSTEM =====

/**
 * Base XP rewards for correct answers based on difficulty
 */
const BASE_XP_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};

/**
 * Bonus XP for first-attempt correct answers
 */
const FIRST_ATTEMPT_BONUS: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 5,
};

/**
 * Lesson and unit rewards
 */
export const LESSON_BASE_XP = 5;
export const LESSON_PERFECT_BONUS = 10;
export const UNIT_BASE_XP = 10;
export const UNIT_PERFECT_BONUS = 20;
export const DAILY_GOAL_XP = 50;
export const STREAK_7_DAY_XP = 100;

/**
 * Calculate XP earned for a single flashcard answer
 */
export function calculateFlashcardXP(
  difficulty: Difficulty,
  isCorrect: boolean,
  isFirstAttempt: boolean = true,
): number {
  if (!isCorrect) return 0;

  let xp = BASE_XP_BY_DIFFICULTY[difficulty];

  if (isFirstAttempt) {
    xp += FIRST_ATTEMPT_BONUS[difficulty];
  }

  return xp;
}

/**
 * Calculate XP earned for lesson completion
 */
export function calculateLessonXP(
  lessonBaseXP: number,
  accuracyPercent: number,
): { baseXP: number; bonusXP: number; totalXP: number } {
  const baseXP = lessonBaseXP;
  const bonusXP = accuracyPercent === 100 ? LESSON_PERFECT_BONUS : 0;

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
  };
}

/**
 * Calculate XP earned for unit completion
 */
export function calculateUnitXP(
  unitBaseXP: number,
  allLessonsPerfect: boolean,
): { baseXP: number; bonusXP: number; totalXP: number } {
  const baseXP = unitBaseXP;
  const bonusXP = allLessonsPerfect ? UNIT_PERFECT_BONUS : 0;

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
  };
}

/**
 * Calculate difficulty from unit number
 * Unit 1 = easy, Units 2-5 = medium, Units 6+ = hard
 */
export function calculateDifficultyFromUnit(unitNumber: number): Difficulty {
  if (unitNumber === 1) return "easy";
  if (unitNumber <= 5) return "medium";
  return "hard";
}

// ===== HEARTS SYSTEM =====

export const MAX_HEARTS = 5;
export const HEART_REFILL_MINUTES = 30;
export const HEARTS_PER_REFILL = 1;

/**
 * Calculate available hearts based on last refill time
 * Hearts refill at a rate of 1 every 30 minutes, up to max of 5
 */
export function calculateAvailableHearts(
  currentHearts: number,
  lastRefillTime: Date,
): { hearts: number; nextRefillMinutes: number } {
  if (currentHearts >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, nextRefillMinutes: 0 };
  }

  const now = new Date();
  const minutesSinceRefill = (now.getTime() - lastRefillTime.getTime()) / 60000;
  const heartsToRefill = Math.floor(minutesSinceRefill / HEART_REFILL_MINUTES);

  const newHearts = Math.min(MAX_HEARTS, currentHearts + heartsToRefill);
  const nextRefillMinutes =
    newHearts >= MAX_HEARTS
      ? 0
      : HEART_REFILL_MINUTES - (minutesSinceRefill % HEART_REFILL_MINUTES);

  return {
    hearts: newHearts,
    nextRefillMinutes: Math.ceil(nextRefillMinutes),
  };
}

/**
 * Check if user can start a lesson (has at least 1 heart)
 */
export function canStartLesson(
  currentHearts: number,
  lastRefillTime: Date,
): boolean {
  const { hearts } = calculateAvailableHearts(currentHearts, lastRefillTime);
  return hearts > 0;
}

/**
 * Calculate hearts after losing one for incorrect answer
 */
export function loseHeart(currentHearts: number): number {
  return Math.max(0, currentHearts - 1);
}

/**
 * Check if lesson should fail (hearts = 0)
 */
export function shouldFailLesson(hearts: number): boolean {
  return hearts <= 0;
}

/**
 * Daily refill - reset to max hearts at midnight
 */
export function shouldDailyRefill(lastRefillTime: Date): boolean {
  const now = new Date();
  const lastRefillDate = new Date(lastRefillTime);

  // Check if it's a new day (comparing dates, not times)
  return (
    now.getDate() !== lastRefillDate.getDate() ||
    now.getMonth() !== lastRefillDate.getMonth() ||
    now.getFullYear() !== lastRefillDate.getFullYear()
  );
}

// ===== STREAK TRACKING =====
// Note: Streak calculation moved to streak-utils.ts for UTC-based tracking
// This function is kept for backward compatibility but should use streak-utils

/**
 * Update streak count based on last activity date (UTC-based)
 * @deprecated Use calculateStreak from streak-utils.ts instead
 */
export function updateStreak(
  currentStreak: number,
  lastActivityDate: Date | null,
): { newStreak: number; streakBonus: number } {
  const lastDate = lastActivityDate ? getUTCDateString(lastActivityDate) : null;
  const { newStreak } = calculateStreak("", lastDate, currentStreak);

  // Calculate streak bonus (7-day milestones)
  const streakBonus =
    newStreak > 0 && newStreak % 7 === 0 ? STREAK_7_DAY_XP : 0;

  return { newStreak, streakBonus };
}

// ===== LESSON PROGRESS TRACKING =====

/**
 * Calculate lesson accuracy percentage
 */
export function calculateAccuracy(
  correctCount: number,
  totalCount: number,
): number {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

/**
 * Check if lesson is perfect (100% accuracy)
 */
export function isPerfectLesson(accuracyPercent: number): boolean {
  return accuracyPercent === 100;
}

// ===== DAILY GOAL TRACKING =====

export const DAILY_GOAL_LESSONS = 10;

/**
 * Check if daily goal is met
 */
export function isDailyGoalMet(lessonsCompletedToday: number): boolean {
  return lessonsCompletedToday >= DAILY_GOAL_LESSONS;
}

/**
 * Calculate daily goal progress percentage
 */
export function calculateDailyGoalProgress(
  lessonsCompletedToday: number,
): number {
  return Math.min(
    100,
    Math.round((lessonsCompletedToday / DAILY_GOAL_LESSONS) * 100),
  );
}
