import type {
  LessonId,
  PathId,
  UnitId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { XP } from "../value-objects/XP";

/**
 * Event fired when a user's streak is broken
 */
export class StreakBrokenEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly previousStreak: number,
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    previousStreak: number,
  ): StreakBrokenEvent {
    return new StreakBrokenEvent(userId, pathId, previousStreak, new Date());
  }
}

/**
 * Event fired when a user's hearts are depleted
 */
export class HeartsDepletedEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly lessonId: LessonId,
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    lessonId: LessonId,
  ): HeartsDepletedEvent {
    return new HeartsDepletedEvent(userId, pathId, lessonId, new Date());
  }
}

/**
 * Event fired when a user completes a unit
 */
export class UnitCompletedEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly unitId: UnitId,
    public readonly xpEarned: XP,
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    unitId: UnitId,
    xpEarned: XP,
  ): UnitCompletedEvent {
    return new UnitCompletedEvent(userId, pathId, unitId, xpEarned, new Date());
  }
}

/**
 * Event fired when a user completes a path
 */
export class PathCompletedEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly totalXpEarned: XP,
    public readonly completionTimeMinutes: number,
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    totalXpEarned: XP,
    completionTimeMinutes: number,
  ): PathCompletedEvent {
    return new PathCompletedEvent(
      userId,
      pathId,
      totalXpEarned,
      completionTimeMinutes,
      new Date(),
    );
  }
}

/**
 * Event fired when XP is earned
 */
export class XPEarnedEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly xpEarned: XP,
    public readonly source: "lesson" | "unit" | "streak" | "perfect",
    public readonly sourceId: number | null,
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    xpEarned: XP,
    source: "lesson" | "unit" | "streak" | "perfect",
    sourceId: number | null = null,
  ): XPEarnedEvent {
    return new XPEarnedEvent(
      userId,
      pathId,
      xpEarned,
      source,
      sourceId,
      new Date(),
    );
  }
}

/**
 * Event fired when hearts are refilled
 */
export class HeartsRefilledEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly heartsRefilled: number,
    public readonly reason: "daily" | "time" | "purchase" | "reward",
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    heartsRefilled: number,
    reason: "daily" | "time" | "purchase" | "reward",
  ): HeartsRefilledEvent {
    return new HeartsRefilledEvent(
      userId,
      pathId,
      heartsRefilled,
      reason,
      new Date(),
    );
  }
}

/**
 * Event fired when a streak milestone is reached
 */
export class StreakMilestoneEvent {
  private constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly streakCount: number,
    public readonly milestone: 3 | 7 | 14 | 30 | 100,
    public readonly bonusXP: XP,
    public readonly occurredAt: Date,
  ) {}

  static create(
    userId: UserId,
    pathId: PathId,
    streakCount: number,
    milestone: 3 | 7 | 14 | 30 | 100,
    bonusXP: XP,
  ): StreakMilestoneEvent {
    return new StreakMilestoneEvent(
      userId,
      pathId,
      streakCount,
      milestone,
      bonusXP,
      new Date(),
    );
  }
}
