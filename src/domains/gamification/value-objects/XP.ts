import { ValidationError } from "@/domains/shared/errors";

/**
 * XP (Experience Points) value object
 *
 * Represents earned experience points in the gamification system.
 * Enforces invariants: XP cannot be negative.
 */
export class XP {
  private constructor(private readonly amount: number) {
    if (amount < 0) {
      throw new ValidationError("XP amount cannot be negative");
    }
  }

  /**
   * Create XP from a specific amount
   */
  static fromAmount(amount: number): XP {
    return new XP(amount);
  }

  /**
   * Create zero XP
   */
  static zero(): XP {
    return new XP(0);
  }

  /**
   * Add two XP amounts together
   */
  add(other: XP): XP {
    return new XP(this.amount + other.amount);
  }

  /**
   * Subtract XP (result cannot be negative)
   */
  subtract(other: XP): XP {
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new ValidationError("Cannot subtract more XP than available");
    }
    return new XP(result);
  }

  /**
   * Multiply XP by a factor
   */
  multiply(factor: number): XP {
    if (factor < 0) {
      throw new ValidationError("Cannot multiply XP by negative factor");
    }
    return new XP(Math.floor(this.amount * factor));
  }

  /**
   * Compare with another XP amount
   */
  isGreaterThan(other: XP): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: XP): boolean {
    return this.amount < other.amount;
  }

  equals(other: XP): boolean {
    return this.amount === other.amount;
  }

  /**
   * Get the raw amount
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Convert to string for display
   */
  toString(): string {
    return `${this.amount} XP`;
  }
}
