/**
 * Pure Streak Utility Functions (Client-Safe)
 *
 * These functions contain no database dependencies and can be safely
 * imported in client components.
 *
 * Based on agent recommendations:
 * - Best Practices: Use UTC for all time operations
 * - Security: Use UTC to prevent timezone manipulation
 *
 * Streak rules:
 * - Day starts at 12 AM UTC
 * - User must complete at least 1 lesson per day to maintain streak
 * - If user doesn't complete a lesson by midnight UTC, streak resets to 0
 * - All timestamps stored in UTC
 */

/**
 * Get current UTC date (YYYY-MM-DD format)
 */
export function getCurrentUTCDate(): string {
  const now = new Date();
  // Convert to UTC and get date string
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get UTC date string from a Date object
 */
export function getUTCDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's UTC date
 */
export function getYesterdayUTCDate(): string {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return getUTCDateString(yesterday);
}

/**
 * Check if a date string is today in UTC
 */
export function isTodayUTC(dateString: string | null): boolean {
  if (!dateString) return false;
  return dateString === getCurrentUTCDate();
}

/**
 * Check if a date string is yesterday in UTC
 */
export function isYesterdayUTC(dateString: string | null): boolean {
  if (!dateString) return false;
  return dateString === getYesterdayUTCDate();
}

/**
 * Calculate and update user streak based on last activity
 * Uses lazy evaluation - checks and updates streak when accessed
 *
 * This is a pure function that doesn't access the database.
 *
 * @param userId - User ID (unused but kept for API compatibility)
 * @param lastActivityDate - Last activity date in UTC (YYYY-MM-DD) or null
 * @param currentStreak - Current streak count
 * @returns Updated streak count and whether streak was maintained today
 */
export function calculateStreak(
  _userId: string,
  lastActivityDate: string | null,
  currentStreak: number,
): { newStreak: number; maintainedToday: boolean } {
  const _today = getCurrentUTCDate();

  // If no last activity, start new streak
  if (!lastActivityDate) {
    return { newStreak: 1, maintainedToday: true };
  }

  // If last activity was today, streak continues (no change)
  if (isTodayUTC(lastActivityDate)) {
    return { newStreak: currentStreak, maintainedToday: true };
  }

  // If last activity was yesterday, increment streak
  if (isYesterdayUTC(lastActivityDate)) {
    return { newStreak: currentStreak + 1, maintainedToday: true };
  }

  // Streak broken (last activity was more than 1 day ago)
  // Reset to 0 (not 1) because user hasn't completed today's task
  return { newStreak: 0, maintainedToday: false };
}
