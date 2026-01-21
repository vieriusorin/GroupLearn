import { ValidationError } from "@/domains/shared/errors";

/**
 * Accuracy value object
 *
 * Represents the percentage of correct answers in a lesson or review session.
 * Enforces invariants: Accuracy must be between 0 and 100.
 */
export class Accuracy {
  private constructor(private readonly percent: number) {
    if (percent < 0 || percent > 100) {
      throw new ValidationError("Accuracy must be between 0 and 100");
    }
  }

  /**
   * Create accuracy from a ratio of correct to total answers
   */
  static fromRatio(correct: number, total: number): Accuracy {
    if (total === 0) {
      return new Accuracy(0);
    }

    if (correct < 0 || total < 0) {
      throw new ValidationError("Correct and total must be non-negative");
    }

    if (correct > total) {
      throw new ValidationError("Correct answers cannot exceed total answers");
    }

    const percent = Math.round((correct / total) * 100);
    return new Accuracy(percent);
  }

  /**
   * Create accuracy from a percentage
   */
  static fromPercent(percent: number): Accuracy {
    return new Accuracy(Math.round(percent));
  }

  /**
   * Create zero accuracy (0%)
   */
  static zero(): Accuracy {
    return new Accuracy(0);
  }

  /**
   * Create perfect accuracy (100%)
   */
  static perfect(): Accuracy {
    return new Accuracy(100);
  }

  /**
   * Check if accuracy is above a threshold
   */
  isAbove(threshold: number): boolean {
    return this.percent > threshold;
  }

  /**
   * Check if accuracy is below a threshold
   */
  isBelow(threshold: number): boolean {
    return this.percent < threshold;
  }

  /**
   * Check if accuracy is perfect (100%)
   */
  isPerfect(): boolean {
    return this.percent === 100;
  }

  /**
   * Check if accuracy is zero (0%)
   */
  isZero(): boolean {
    return this.percent === 0;
  }

  /**
   * Get the percentage value
   */
  getPercent(): number {
    return this.percent;
  }

  /**
   * Get accuracy as decimal (0.0 to 1.0)
   */
  getDecimal(): number {
    return this.percent / 100;
  }

  /**
   * Compare with another accuracy
   */
  equals(other: Accuracy): boolean {
    return this.percent === other.percent;
  }

  /**
   * Convert to string for display
   */
  toString(): string {
    return `${this.percent}%`;
  }
}
