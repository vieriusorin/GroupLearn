import { Hearts } from "../value-objects/Hearts";

/**
 * Heart Refill Service
 *
 * Domain service responsible for managing heart refill logic.
 * Determines when hearts can be refilled and how many hearts to refill.
 */
export class HeartRefillService {
  // Configuration constants
  private static readonly REFILL_INTERVAL_HOURS = 24;
  private static readonly MAX_HEARTS = 5;
  private static readonly PARTIAL_REFILL_HOURS = 4; // Refill 1 heart every 4 hours

  /**
   * Check if hearts can be fully refilled (24-hour cooldown)
   *
   * @param lastRefillDate Date of last full refill
   * @param currentDate Current date (defaults to now)
   * @returns True if hearts can be refilled
   */
  canRefillHearts(
    lastRefillDate: Date,
    currentDate: Date = new Date(),
  ): boolean {
    const hoursSinceRefill = this.hoursBetween(lastRefillDate, currentDate);
    return hoursSinceRefill >= HeartRefillService.REFILL_INTERVAL_HOURS;
  }

  /**
   * Calculate the next time hearts can be fully refilled
   *
   * @param lastRefillDate Date of last full refill
   * @returns Date when hearts can next be refilled
   */
  getNextRefillTime(lastRefillDate: Date): Date {
    const nextRefill = new Date(lastRefillDate);
    nextRefill.setHours(
      nextRefill.getHours() + HeartRefillService.REFILL_INTERVAL_HOURS,
    );
    return nextRefill;
  }

  /**
   * Calculate hours remaining until next refill
   *
   * @param lastRefillDate Date of last full refill
   * @param currentDate Current date (defaults to now)
   * @returns Hours remaining (0 if refill is available)
   */
  hoursUntilRefill(
    lastRefillDate: Date,
    currentDate: Date = new Date(),
  ): number {
    const hoursSinceRefill = this.hoursBetween(lastRefillDate, currentDate);
    const hoursRemaining =
      HeartRefillService.REFILL_INTERVAL_HOURS - hoursSinceRefill;
    return Math.max(0, Math.ceil(hoursRemaining));
  }

  /**
   * Calculate how many hearts can be passively refilled since last activity
   *
   * Hearts refill at a rate of 1 heart per PARTIAL_REFILL_HOURS (default: 4 hours)
   *
   * @param currentHearts Current number of hearts
   * @param lastActivityDate Date of last activity
   * @param currentDate Current date (defaults to now)
   * @returns Updated Hearts value object
   */
  calculatePassiveRefill(
    currentHearts: Hearts,
    lastActivityDate: Date,
    currentDate: Date = new Date(),
  ): Hearts {
    // If already at max, no refill needed
    if (currentHearts.remaining() >= HeartRefillService.MAX_HEARTS) {
      return currentHearts;
    }

    const hoursSinceActivity = this.hoursBetween(lastActivityDate, currentDate);
    const heartsToRefill = Math.floor(
      hoursSinceActivity / HeartRefillService.PARTIAL_REFILL_HOURS,
    );

    if (heartsToRefill === 0) {
      return currentHearts;
    }

    // Calculate new heart count (capped at max)
    const newHeartCount = Math.min(
      currentHearts.remaining() + heartsToRefill,
      HeartRefillService.MAX_HEARTS,
    );

    return Hearts.create(newHeartCount);
  }

  /**
   * Perform a full heart refill
   *
   * @returns Full hearts (5 hearts)
   */
  performFullRefill(): Hearts {
    return Hearts.full();
  }

  /**
   * Check if a daily refill should occur
   *
   * Daily refill happens once per day at a specific time (e.g., midnight)
   *
   * @param lastDailyRefillDate Date of last daily refill
   * @param currentDate Current date (defaults to now)
   * @returns True if daily refill should occur
   */
  shouldPerformDailyRefill(
    lastDailyRefillDate: Date | null,
    currentDate: Date = new Date(),
  ): boolean {
    if (!lastDailyRefillDate) {
      return true; // First time, always refill
    }

    // Check if we're on a different day
    return !this.isSameDay(lastDailyRefillDate, currentDate);
  }

  /**
   * Calculate the refill progress as a percentage
   *
   * @param lastRefillDate Date of last full refill
   * @param currentDate Current date (defaults to now)
   * @returns Percentage (0-100) of time until next refill
   */
  getRefillProgress(
    lastRefillDate: Date,
    currentDate: Date = new Date(),
  ): number {
    const hoursSinceRefill = this.hoursBetween(lastRefillDate, currentDate);
    const progress =
      (hoursSinceRefill / HeartRefillService.REFILL_INTERVAL_HOURS) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Calculate hours between two dates
   */
  private hoursBetween(startDate: Date, endDate: Date): number {
    const msPerHour = 60 * 60 * 1000;
    return (endDate.getTime() - startDate.getTime()) / msPerHour;
  }

  /**
   * Check if two dates are on the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
