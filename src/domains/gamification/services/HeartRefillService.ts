import { Hearts } from "../value-objects/Hearts";

export class HeartRefillService {
  private static readonly REFILL_INTERVAL_HOURS = 24;
  private static readonly MAX_HEARTS = 5;
  private static readonly PARTIAL_REFILL_HOURS = 4; // Refill 1 heart every 4 hours

  canRefillHearts(
    lastRefillDate: Date,
    currentDate: Date = new Date(),
  ): boolean {
    const hoursSinceRefill = this.hoursBetween(lastRefillDate, currentDate);
    return hoursSinceRefill >= HeartRefillService.REFILL_INTERVAL_HOURS;
  }

  getNextRefillTime(lastRefillDate: Date): Date {
    const nextRefill = new Date(lastRefillDate);
    nextRefill.setHours(
      nextRefill.getHours() + HeartRefillService.REFILL_INTERVAL_HOURS,
    );
    return nextRefill;
  }

  hoursUntilRefill(
    lastRefillDate: Date,
    currentDate: Date = new Date(),
  ): number {
    const hoursSinceRefill = this.hoursBetween(lastRefillDate, currentDate);
    const hoursRemaining =
      HeartRefillService.REFILL_INTERVAL_HOURS - hoursSinceRefill;
    return Math.max(0, Math.ceil(hoursRemaining));
  }

  calculatePassiveRefill(
    currentHearts: Hearts,
    lastActivityDate: Date,
    currentDate: Date = new Date(),
  ): Hearts {
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

    const newHeartCount = Math.min(
      currentHearts.remaining() + heartsToRefill,
      HeartRefillService.MAX_HEARTS,
    );

    return Hearts.create(newHeartCount);
  }

  performFullRefill(): Hearts {
    return Hearts.full();
  }

  shouldPerformDailyRefill(
    lastDailyRefillDate: Date | null,
    currentDate: Date = new Date(),
  ): boolean {
    if (!lastDailyRefillDate) {
      return true;
    }

    return !this.isSameDay(lastDailyRefillDate, currentDate);
  }

  getRefillProgress(
    lastRefillDate: Date,
    currentDate: Date = new Date(),
  ): number {
    const hoursSinceRefill = this.hoursBetween(lastRefillDate, currentDate);
    const progress =
      (hoursSinceRefill / HeartRefillService.REFILL_INTERVAL_HOURS) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  private hoursBetween(startDate: Date, endDate: Date): number {
    const msPerHour = 60 * 60 * 1000;
    return (endDate.getTime() - startDate.getTime()) / msPerHour;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
}
