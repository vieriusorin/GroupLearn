import { ValidationError } from "@/domains/shared/errors";

export class XP {
  private constructor(private readonly amount: number) {
    if (amount < 0) {
      throw new ValidationError("XP amount cannot be negative");
    }
  }

  static fromAmount(amount: number): XP {
    return new XP(amount);
  }

  static zero(): XP {
    return new XP(0);
  }

  add(other: XP): XP {
    return new XP(this.amount + other.amount);
  }

  subtract(other: XP): XP {
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new ValidationError("Cannot subtract more XP than available");
    }
    return new XP(result);
  }

  multiply(factor: number): XP {
    if (factor < 0) {
      throw new ValidationError("Cannot multiply XP by negative factor");
    }
    return new XP(Math.floor(this.amount * factor));
  }

  isGreaterThan(other: XP): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: XP): boolean {
    return this.amount < other.amount;
  }

  equals(other: XP): boolean {
    return this.amount === other.amount;
  }

  getAmount(): number {
    return this.amount;
  }

  toString(): string {
    return `${this.amount} XP`;
  }
}
