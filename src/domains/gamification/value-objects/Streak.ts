import { ValidationError } from "@/domains/shared/errors";

/**
 * Streak value object
 *
 * Represents a user's consecutive days of activity.
 * Streaks increment when activity happens on consecutive days,
 * and reset when a day is skipped.
 */
export class Streak {
  private constructor(
    private readonly count: number,
    private readonly lastActivityDate: Date,
  ) {
    if (count < 0) {
      throw new ValidationError("Streak count cannot be negative");
    }
  }

  /**
   * Create streak from existing count and last activity date
   */
  static fromCount(count: number, lastActivityDate: Date): Streak {
    return new Streak(count, lastActivityDate);
  }

  /**
   * Create a new streak (count = 0, no activity)
   */
  static new(): Streak {
    return new Streak(0, new Date(0)); // Epoch date for "never"
  }

  /**
   * Start a new streak (alias for new)
   */
  static start(): Streak {
    return Streak.new();
  }

  /**
   * Create a zero streak (alias for new)
   */
  static zero(): Streak {
    return Streak.new();
  }

  /**
   * Increment streak based on current date
   *
   * Rules:
   * - If already counted today: return unchanged
   * - If last activity was yesterday: increment by 1
   * - If last activity was before yesterday: reset to 1
   */
  increment(): Streak {
    const now = new Date();

    // Already counted today
    if (this.isSameDay(this.lastActivityDate, now)) {
      return this;
    }

    // Activity on consecutive day (yesterday)
    if (this.isYesterday(this.lastActivityDate, now)) {
      return new Streak(this.count + 1, now);
    }

    // Streak broken - reset to 1
    return new Streak(1, now);
  }

  /**
   * Reset streak to zero
   */
  reset(): Streak {
    return Streak.new();
  }

  /**
   * Check if streak is active (activity within last 24 hours)
   */
  isActive(): boolean {
    const now = new Date();
    return (
      this.isSameDay(this.lastActivityDate, now) ||
      this.isYesterday(this.lastActivityDate, now)
    );
  }

  /**
   * Check if streak is broken (no activity yesterday or today)
   */
  isBroken(): boolean {
    return !this.isActive() && this.count > 0;
  }

  /**
   * Get streak count
   */
  getCount(): number {
    return this.count;
  }

  /**
   * Get last activity date
   */
  getLastActivityDate(): Date {
    return new Date(this.lastActivityDate);
  }

  /**
   * Check if this is a milestone streak (multiple of 7)
   */
  isMilestone(): boolean {
    return this.count > 0 && this.count % 7 === 0;
  }

  /**
   * Get days until next milestone
   */
  daysUntilNextMilestone(): number {
    if (this.count === 0) return 7;
    return 7 - (this.count % 7);
  }

  /**
   * Compare with another Streak
   */
  equals(other: Streak): boolean {
    return (
      this.count === other.count &&
      this.isSameDay(this.lastActivityDate, other.lastActivityDate)
    );
  }

  /**
   * Check if two dates are the same day (ignoring time)
   */
  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  /**
   * Check if d1 is the day before d2
   */
  private isYesterday(d1: Date, d2: Date): boolean {
    const yesterday = new Date(d2);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDay(d1, yesterday);
  }

  /**
   * Convert to string for display
   */
  toString(): string {
    if (this.count === 0) return "No streak";
    return `${this.count} day${this.count === 1 ? "" : "s"} 🔥`;
  }
}
