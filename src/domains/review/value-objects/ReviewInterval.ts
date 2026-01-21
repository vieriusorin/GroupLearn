import { ValidationError } from "@/domains/shared/errors";

/**
 * ReviewInterval value object
 *
 * Represents the interval between reviews in a spaced repetition system.
 * Enforces invariants: Interval must be at least 1 day.
 */
export class ReviewInterval {
  private constructor(private readonly days: number) {
    if (days < 1) {
      throw new ValidationError("Review interval must be at least 1 day");
    }

    if (!Number.isInteger(days)) {
      throw new ValidationError(
        "Review interval must be a whole number of days",
      );
    }
  }

  /**
   * Create interval from number of days
   */
  static fromDays(days: number): ReviewInterval {
    return new ReviewInterval(Math.floor(days));
  }

  /**
   * Common intervals for spaced repetition
   */
  static firstReview(): ReviewInterval {
    return new ReviewInterval(1);
  }

  static secondReview(): ReviewInterval {
    return new ReviewInterval(3);
  }

  static thirdReview(): ReviewInterval {
    return new ReviewInterval(7);
  }

  static fourthReview(): ReviewInterval {
    return new ReviewInterval(14);
  }

  static mastered(): ReviewInterval {
    return new ReviewInterval(30);
  }

  /**
   * Get the number of days
   */
  getDays(): number {
    return this.days;
  }

  /**
   * Calculate the next review date from a given date
   */
  calculateNextReviewDate(fromDate: Date = new Date()): Date {
    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + this.days);
    return nextDate;
  }

  /**
   * Double the interval (for successful reviews)
   */
  double(): ReviewInterval {
    return new ReviewInterval(Math.min(this.days * 2, 365)); // Cap at 1 year
  }

  /**
   * Halve the interval (for failed reviews)
   */
  halve(): ReviewInterval {
    return new ReviewInterval(Math.max(Math.floor(this.days / 2), 1));
  }

  /**
   * Reset to first review interval (for failed reviews)
   */
  reset(): ReviewInterval {
    return ReviewInterval.firstReview();
  }

  /**
   * Check if this is a short interval (< 7 days)
   */
  isShort(): boolean {
    return this.days < 7;
  }

  /**
   * Check if this is a medium interval (7-30 days)
   */
  isMedium(): boolean {
    return this.days >= 7 && this.days < 30;
  }

  /**
   * Check if this is a long interval (>= 30 days)
   */
  isLong(): boolean {
    return this.days >= 30;
  }

  /**
   * Compare with another interval
   */
  equals(other: ReviewInterval): boolean {
    return this.days === other.days;
  }

  isLongerThan(other: ReviewInterval): boolean {
    return this.days > other.days;
  }

  isShorterThan(other: ReviewInterval): boolean {
    return this.days < other.days;
  }

  /**
   * Convert to string for display
   */
  toString(): string {
    if (this.days === 1) {
      return "1 day";
    }
    return `${this.days} days`;
  }
}
