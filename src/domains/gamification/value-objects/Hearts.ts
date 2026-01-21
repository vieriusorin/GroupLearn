import { DomainError, ValidationError } from "@/domains/shared/errors";

/**
 * Hearts value object
 *
 * Represents the life points system in the learning platform.
 * Users have a maximum of 5 hearts and lose one for incorrect answers.
 */
export class Hearts {
  private static readonly MAX = 5;
  private static readonly MIN = 0;

  private constructor(private readonly _remaining: number) {
    if (_remaining < Hearts.MIN || _remaining > Hearts.MAX) {
      throw new ValidationError(
        `Hearts must be between ${Hearts.MIN} and ${Hearts.MAX}`,
      );
    }
  }

  /**
   * Create hearts with full amount (5)
   */
  static full(): Hearts {
    return new Hearts(Hearts.MAX);
  }

  /**
   * Create hearts with specific amount
   */
  static create(count: number): Hearts {
    return new Hearts(count);
  }

  /**
   * Create empty hearts (0)
   */
  static empty(): Hearts {
    return new Hearts(Hearts.MIN);
  }

  /**
   * Deduct one heart
   * @throws DomainError if no hearts remaining
   */
  deduct(): Hearts {
    if (this.isEmpty()) {
      throw new DomainError("No hearts remaining", "NO_HEARTS");
    }
    return new Hearts(this._remaining - 1);
  }

  /**
   * Add one heart (up to maximum)
   */
  refillOne(): Hearts {
    if (this.isFull()) {
      return this;
    }
    return new Hearts(this._remaining + 1);
  }

  /**
   * Refill one heart (alias for refillOne)
   */
  refill(): Hearts {
    return this.refillOne();
  }

  /**
   * Refill to full hearts
   */
  refillAll(): Hearts {
    return Hearts.full();
  }

  /**
   * Check if empty (no hearts left)
   */
  isEmpty(): boolean {
    return this._remaining === Hearts.MIN;
  }

  /**
   * Check if full (all 5 hearts)
   */
  isFull(): boolean {
    return this._remaining === Hearts.MAX;
  }

  /**
   * Check if running low (1-2 hearts)
   */
  isLow(): boolean {
    return this._remaining <= 2 && this._remaining > 0;
  }

  /**
   * Get remaining hearts count
   */
  getRemaining(): number {
    return this._remaining;
  }

  /**
   * Get remaining hearts count (alias for getRemaining)
   */
  remaining(): number {
    return this._remaining;
  }

  /**
   * Get maximum hearts
   */
  static getMax(): number {
    return Hearts.MAX;
  }

  /**
   * Compare with another Hearts value
   */
  equals(other: Hearts): boolean {
    return this._remaining === other._remaining;
  }

  /**
   * Convert to string for display
   */
  toString(): string {
    return `${"❤️".repeat(this._remaining)}${"🤍".repeat(Hearts.MAX - this._remaining)}`;
  }
}
