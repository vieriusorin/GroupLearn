import { DomainError, ValidationError } from "@/domains/shared/errors";

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

  static full(): Hearts {
    return new Hearts(Hearts.MAX);
  }

  static create(count: number): Hearts {
    return new Hearts(count);
  }

  static empty(): Hearts {
    return new Hearts(Hearts.MIN);
  }

  deduct(): Hearts {
    if (this.isEmpty()) {
      throw new DomainError("No hearts remaining", "NO_HEARTS");
    }
    return new Hearts(this._remaining - 1);
  }

  refillOne(): Hearts {
    if (this.isFull()) {
      return this;
    }
    return new Hearts(this._remaining + 1);
  }

  refill(): Hearts {
    return this.refillOne();
  }

  refillAll(): Hearts {
    return Hearts.full();
  }

  isEmpty(): boolean {
    return this._remaining === Hearts.MIN;
  }

  isFull(): boolean {
    return this._remaining === Hearts.MAX;
  }

  isLow(): boolean {
    return this._remaining <= 2 && this._remaining > 0;
  }

  getRemaining(): number {
    return this._remaining;
  }

  remaining(): number {
    return this._remaining;
  }

  static getMax(): number {
    return Hearts.MAX;
  }

  equals(other: Hearts): boolean {
    return this._remaining === other._remaining;
  }

  toString(): string {
    return `${"❤️".repeat(this._remaining)}${"🤍".repeat(Hearts.MAX - this._remaining)}`;
  }
}
