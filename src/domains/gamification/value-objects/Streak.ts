import { ValidationError } from "@/domains/shared/errors";

export class Streak {
  private constructor(
    private readonly count: number,
    private readonly lastActivityDate: Date,
  ) {
    if (count < 0) {
      throw new ValidationError("Streak count cannot be negative");
    }
  }

  static fromCount(count: number, lastActivityDate: Date): Streak {
    return new Streak(count, lastActivityDate);
  }

  static new(): Streak {
    return new Streak(0, new Date(0)); // Epoch date for "never"
  }

  static start(): Streak {
    return Streak.new();
  }

  static zero(): Streak {
    return Streak.new();
  }

  increment(): Streak {
    const now = new Date();

    if (this.isSameDay(this.lastActivityDate, now)) {
      return this;
    }

    if (this.isYesterday(this.lastActivityDate, now)) {
      return new Streak(this.count + 1, now);
    }

    return new Streak(1, now);
  }

  reset(): Streak {
    return Streak.new();
  }

  isActive(): boolean {
    const now = new Date();
    return (
      this.isSameDay(this.lastActivityDate, now) ||
      this.isYesterday(this.lastActivityDate, now)
    );
  }

  isBroken(): boolean {
    return !this.isActive() && this.count > 0;
  }

  getCount(): number {
    return this.count;
  }

  getLastActivityDate(): Date {
    return new Date(this.lastActivityDate);
  }

  isMilestone(): boolean {
    return this.count > 0 && this.count % 7 === 0;
  }

  daysUntilNextMilestone(): number {
    if (this.count === 0) return 7;
    return 7 - (this.count % 7);
  }

  equals(other: Streak): boolean {
    return (
      this.count === other.count &&
      this.isSameDay(this.lastActivityDate, other.lastActivityDate)
    );
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  private isYesterday(d1: Date, d2: Date): boolean {
    const yesterday = new Date(d2);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDay(d1, yesterday);
  }

  toString(): string {
    if (this.count === 0) return "No streak";
    return `${this.count} day${this.count === 1 ? "" : "s"} 🔥`;
  }
}
