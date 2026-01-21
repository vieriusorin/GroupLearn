import { ValidationError } from "@/domains/shared/errors";

/**
 * Progress value object
 *
 * Represents progress through a lesson or unit (e.g., "5 of 10 cards completed").
 * Enforces invariants: completed cannot exceed total, both must be non-negative.
 */
export class Progress {
  private constructor(
    private readonly completed: number,
    private readonly total: number,
  ) {
    if (completed < 0 || total < 0) {
      throw new ValidationError("Progress values cannot be negative");
    }

    if (completed > total) {
      throw new ValidationError("Completed cannot exceed total");
    }
  }

  /**
   * Create progress from completed and total values
   */
  static fromRatio(completed: number, total: number): Progress {
    return new Progress(completed, total);
  }

  /**
   * Create progress with zero completion
   */
  static zero(total: number): Progress {
    return new Progress(0, total);
  }

  /**
   * Create progress at 100% completion
   */
  static complete(total: number): Progress {
    return new Progress(total, total);
  }

  /**
   * Get percentage completion (0-100)
   */
  getPercentage(): number {
    if (this.total === 0) {
      return 0;
    }
    return Math.round((this.completed / this.total) * 100);
  }

  /**
   * Get decimal completion (0.0-1.0)
   */
  getDecimal(): number {
    if (this.total === 0) {
      return 0;
    }
    return this.completed / this.total;
  }

  /**
   * Check if progress is complete (100%)
   */
  isComplete(): boolean {
    return this.completed >= this.total;
  }

  /**
   * Check if no progress has been made (0%)
   */
  isNotStarted(): boolean {
    return this.completed === 0;
  }

  /**
   * Get the number of completed items
   */
  getCompleted(): number {
    return this.completed;
  }

  /**
   * Get the total number of items
   */
  getTotal(): number {
    return this.total;
  }

  /**
   * Get the number of remaining items
   */
  getRemaining(): number {
    return this.total - this.completed;
  }

  /**
   * Advance progress by one item
   */
  advance(): Progress {
    if (this.isComplete()) {
      throw new ValidationError("Progress is already complete");
    }
    return new Progress(this.completed + 1, this.total);
  }

  /**
   * Compare with another progress
   */
  equals(other: Progress): boolean {
    return this.completed === other.completed && this.total === other.total;
  }

  /**
   * Convert to string for display
   */
  toString(): string {
    return `${this.completed}/${this.total} (${this.getPercentage()}%)`;
  }
}
