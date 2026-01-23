import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { calculateStreak, getUTCDateString } from "./streak-utils";

const BASE_XP_BY_DIFFICULTY: Record<DifficultyLevelType, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
};

const FIRST_ATTEMPT_BONUS: Record<DifficultyLevelType, number> = {
  easy: 2,
  medium: 3,
  hard: 5,
};

export const LESSON_BASE_XP = 5;
export const LESSON_PERFECT_BONUS = 10;
export const UNIT_BASE_XP = 10;
export const UNIT_PERFECT_BONUS = 20;
export const DAILY_GOAL_XP = 50;
export const STREAK_7_DAY_XP = 100;

export function calculateFlashcardXP(
  difficulty: DifficultyLevelType,
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

export function calculateDifficultyFromUnit(
  unitNumber: number,
): DifficultyLevelType {
  if (unitNumber === 1) return "easy";
  if (unitNumber <= 5) return "medium";
  return "hard";
}

export const MAX_HEARTS = 5;
export const HEART_REFILL_MINUTES = 30;
export const HEARTS_PER_REFILL = 1;

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

export function canStartLesson(
  currentHearts: number,
  lastRefillTime: Date,
): boolean {
  const { hearts } = calculateAvailableHearts(currentHearts, lastRefillTime);
  return hearts > 0;
}

export function loseHeart(currentHearts: number): number {
  return Math.max(0, currentHearts - 1);
}

export function shouldFailLesson(hearts: number): boolean {
  return hearts <= 0;
}

export function shouldDailyRefill(lastRefillTime: Date): boolean {
  const now = new Date();
  const lastRefillDate = new Date(lastRefillTime);

  return (
    now.getDate() !== lastRefillDate.getDate() ||
    now.getMonth() !== lastRefillDate.getMonth() ||
    now.getFullYear() !== lastRefillDate.getFullYear()
  );
}

export function updateStreak(
  currentStreak: number,
  lastActivityDate: Date | null,
): { newStreak: number; streakBonus: number } {
  const lastDate = lastActivityDate ? getUTCDateString(lastActivityDate) : null;
  const { newStreak } = calculateStreak("", lastDate, currentStreak);

  const streakBonus =
    newStreak > 0 && newStreak % 7 === 0 ? STREAK_7_DAY_XP : 0;

  return { newStreak, streakBonus };
}

export function calculateAccuracy(
  correctCount: number,
  totalCount: number,
): number {
  if (totalCount === 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

export function isPerfectLesson(accuracyPercent: number): boolean {
  return accuracyPercent === 100;
}

export const DAILY_GOAL_LESSONS = 10;

export function isDailyGoalMet(lessonsCompletedToday: number): boolean {
  return lessonsCompletedToday >= DAILY_GOAL_LESSONS;
}

export function calculateDailyGoalProgress(
  lessonsCompletedToday: number,
): number {
  return Math.min(
    100,
    Math.round((lessonsCompletedToday / DAILY_GOAL_LESSONS) * 100),
  );
}
