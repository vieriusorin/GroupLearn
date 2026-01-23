import type { Accuracy } from "@/domains/learning-path/value-objects/Accuracy";
import { DomainError } from "@/domains/shared/errors";
import type {
  GroupId,
  LessonId,
  PathId,
  UnitId,
  UserId,
  UserProgressId,
} from "@/domains/shared/types/branded-types";
import { Hearts } from "../value-objects/Hearts";
import { Streak } from "../value-objects/Streak";
import { XP } from "../value-objects/XP";

/**
 * Domain events for UserProgress
 */
export class XPEarnedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly xpAmount: number,
    public readonly newTotal: number,
    public readonly source: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class LevelUpEvent {
  constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly newLevel: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class StreakUpdatedEvent {
  constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly newStreak: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class StreakBrokenEvent {
  constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly previousStreak: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class HeartsRefilledEvent {
  constructor(
    public readonly userId: UserId,
    public readonly pathId: PathId,
    public readonly heartsRestored: number,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

export class UserProgress {
  private events: any[] = [];
  private readonly XP_PER_LEVEL = 100;
  private readonly HEARTS_REFILL_INTERVAL_HOURS = 4;
  private readonly HEARTS_FULL_REFILL_HOURS = 24;

  private constructor(
    private readonly id: UserProgressId | null,
    private readonly userId: UserId,
    private readonly pathId: PathId,
    private xp: XP,
    private hearts: Hearts,
    private streak: Streak,
    private lastHeartRefill: Date,
    private lastActivityDate: Date | null,
    private currentUnitId: UnitId | null,
    private currentLessonId: LessonId | null,
    private readonly groupId: GroupId | null,
    private readonly startedAt: Date,
    private completedAt: Date | null,
    private timeSpentTotal: number,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    this.validateInvariants();
  }

  static start(
    userId: UserId,
    pathId: PathId,
    groupId: GroupId | null = null,
  ): UserProgress {
    const now = new Date();
    return new UserProgress(
      null, // No ID yet
      userId,
      pathId,
      XP.zero(),
      Hearts.create(5), // Start with full hearts
      Streak.start(),
      now, // Last heart refill
      now, // Last activity
      null, // No current unit yet
      null, // No current lesson yet
      groupId,
      now, // Started at
      null, // Not completed
      0, // No time spent yet
      now, // Created at
      now, // Updated at
    );
  }

  /**
   * Reconstitute existing progress from database
   */
  static reconstitute(
    id: UserProgressId,
    userId: UserId,
    pathId: PathId,
    totalXP: number,
    hearts: number,
    streakCount: number,
    lastHeartRefill: Date,
    lastActivityDate: Date | null,
    currentUnitId: UnitId | null,
    currentLessonId: LessonId | null,
    groupId: GroupId | null,
    startedAt: Date,
    completedAt: Date | null,
    timeSpentTotal: number,
    createdAt: Date,
    updatedAt: Date,
  ): UserProgress {
    return new UserProgress(
      id,
      userId,
      pathId,
      XP.fromAmount(totalXP),
      Hearts.create(hearts),
      Streak.fromCount(streakCount, lastActivityDate || new Date()),
      lastHeartRefill,
      lastActivityDate,
      currentUnitId,
      currentLessonId,
      groupId,
      startedAt,
      completedAt,
      timeSpentTotal,
      createdAt,
      updatedAt,
    );
  }

  awardXP(xpAmount: XP, source: string): void {
    const oldLevel = this.getLevel();
    const _oldTotal = this.xp.getAmount();

    this.xp = this.xp.add(xpAmount);
    this.updatedAt = new Date();

    // Emit XP earned event
    this.events.push(
      new XPEarnedEvent(
        this.userId,
        this.pathId,
        xpAmount.getAmount(),
        this.xp.getAmount(),
        source,
      ),
    );

    // Check for level up
    const newLevel = this.getLevel();
    if (newLevel > oldLevel) {
      this.events.push(new LevelUpEvent(this.userId, this.pathId, newLevel));
    }
  }

  refillHearts(): void {
    const now = new Date();
    const hoursSinceRefill =
      (now.getTime() - this.lastHeartRefill.getTime()) / (1000 * 60 * 60);

    let heartsToAdd = 0;

    if (hoursSinceRefill >= this.HEARTS_FULL_REFILL_HOURS) {
      heartsToAdd = 5 - this.hearts.remaining();
      this.hearts = Hearts.create(5);
      this.lastHeartRefill = now;
    }
    // Incremental refill every 4 hours
    else if (hoursSinceRefill >= this.HEARTS_REFILL_INTERVAL_HOURS) {
      const refillsAvailable = Math.floor(
        hoursSinceRefill / this.HEARTS_REFILL_INTERVAL_HOURS,
      );
      heartsToAdd = Math.min(refillsAvailable, 5 - this.hearts.remaining());

      if (heartsToAdd > 0) {
        for (let i = 0; i < heartsToAdd; i++) {
          this.hearts = this.hearts.refill();
        }
        this.lastHeartRefill = new Date(
          this.lastHeartRefill.getTime() +
            refillsAvailable *
              this.HEARTS_REFILL_INTERVAL_HOURS *
              60 *
              60 *
              1000,
        );
      }
    }

    if (heartsToAdd > 0) {
      this.updatedAt = now;
      this.events.push(
        new HeartsRefilledEvent(this.userId, this.pathId, heartsToAdd),
      );
    }
  }

  /**
   * Deduct hearts (for incorrect answers)
   */
  deductHeart(): void {
    this.hearts = this.hearts.deduct();
    this.updatedAt = new Date();
  }

  /**
   * Update streak based on activity
   * Should be called once per day when user completes a lesson
   */
  updateStreak(): void {
    const now = new Date();
    const oldCount = this.streak.getCount();

    // Check if activity is from today
    if (this.lastActivityDate) {
      const daysSinceLastActivity = this.getDaysBetween(
        this.lastActivityDate,
        now,
      );

      if (daysSinceLastActivity === 0) {
        // Same day, don't change streak
        return;
      } else if (daysSinceLastActivity === 1) {
        // Consecutive day, increment streak
        this.streak = this.streak.increment();
      } else {
        // Streak broken
        const previousStreak = this.streak.getCount();
        this.streak = Streak.start();
        this.events.push(
          new StreakBrokenEvent(this.userId, this.pathId, previousStreak),
        );
      }
    } else {
      // First activity
      this.streak = Streak.start();
    }

    this.lastActivityDate = now;
    this.updatedAt = now;

    // Emit streak updated event if changed
    if (this.streak.getCount() !== oldCount) {
      this.events.push(
        new StreakUpdatedEvent(
          this.userId,
          this.pathId,
          this.streak.getCount(),
        ),
      );
    }
  }

  /**
   * Break the streak manually
   */
  breakStreak(): void {
    const previousStreak = this.streak.getCount();
    this.streak = Streak.start();
    this.updatedAt = new Date();

    if (previousStreak > 0) {
      this.events.push(
        new StreakBrokenEvent(this.userId, this.pathId, previousStreak),
      );
    }
  }

  /**
   * Complete a lesson and update progress
   *
   * @param lessonId The lesson completed
   * @param accuracy The accuracy achieved
   * @param xpEarned The XP earned
   * @param heartsRemaining Hearts remaining after lesson
   */
  completeLesson(
    lessonId: LessonId,
    _accuracy: Accuracy,
    xpEarned: XP,
    heartsRemaining: Hearts,
  ): void {
    this.awardXP(xpEarned, "lesson_completion");
    this.hearts = heartsRemaining;
    this.currentLessonId = lessonId;
    this.updateStreak();
  }

  /**
   * Mark current position in the path
   */
  setCurrentPosition(unitId: UnitId, lessonId: LessonId): void {
    this.currentUnitId = unitId;
    this.currentLessonId = lessonId;
    this.updatedAt = new Date();
  }

  /**
   * Mark the path as completed
   */
  completePath(): void {
    this.completedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Add time spent on the path
   */
  addTimeSpent(seconds: number): void {
    if (seconds < 0) {
      throw new DomainError(
        "Time spent cannot be negative",
        "INVALID_TIME_SPENT",
      );
    }
    this.timeSpentTotal += seconds;
    this.updatedAt = new Date();
  }

  // Getters

  getId(): UserProgressId | null {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getPathId(): PathId {
    return this.pathId;
  }

  getXP(): XP {
    return this.xp;
  }

  getLevel(): number {
    return Math.floor(this.xp.getAmount() / this.XP_PER_LEVEL);
  }

  getXPToNextLevel(): number {
    const _currentLevelXP = this.getLevel() * this.XP_PER_LEVEL;
    const nextLevelXP = (this.getLevel() + 1) * this.XP_PER_LEVEL;
    return nextLevelXP - this.xp.getAmount();
  }

  getHearts(): Hearts {
    return this.hearts;
  }

  getStreak(): Streak {
    return this.streak;
  }

  getLastHeartRefill(): Date {
    return new Date(this.lastHeartRefill);
  }

  getLastActivityDate(): Date | null {
    return this.lastActivityDate ? new Date(this.lastActivityDate) : null;
  }

  getCurrentUnitId(): UnitId | null {
    return this.currentUnitId;
  }

  getCurrentLessonId(): LessonId | null {
    return this.currentLessonId;
  }

  getGroupId(): GroupId | null {
    return this.groupId;
  }

  getStartedAt(): Date {
    // Ensure we always return a valid date
    const date = new Date(this.startedAt);
    if (Number.isNaN(date.getTime())) {
      // Fallback to createdAt if startedAt is invalid
      return new Date(this.createdAt);
    }
    return date;
  }

  getCompletedAt(): Date | null {
    return this.completedAt ? new Date(this.completedAt) : null;
  }

  getTimeSpentTotal(): number {
    return this.timeSpentTotal;
  }

  isCompleted(): boolean {
    return this.completedAt !== null;
  }

  isNew(): boolean {
    return this.id === null;
  }

  // Domain events

  getEvents(): ReadonlyArray<any> {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  // Helpers

  private getDaysBetween(date1: Date, date2: Date): number {
    const day1 = new Date(
      date1.getFullYear(),
      date1.getMonth(),
      date1.getDate(),
    );
    const day2 = new Date(
      date2.getFullYear(),
      date2.getMonth(),
      date2.getDate(),
    );
    const diffTime = Math.abs(day2.getTime() - day1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private validateInvariants(): void {
    if (this.timeSpentTotal < 0) {
      throw new DomainError(
        "Time spent cannot be negative",
        "INVALID_TIME_SPENT",
      );
    }
  }

  /**
   * Convert to plain object for serialization
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      pathId: this.pathId,
      totalXP: this.xp.getAmount(),
      level: this.getLevel(),
      xpToNextLevel: this.getXPToNextLevel(),
      hearts: this.hearts.remaining(),
      streakCount: this.streak.getCount(),
      lastHeartRefill: this.lastHeartRefill.toISOString(),
      lastActivityDate: this.lastActivityDate?.toISOString() || null,
      currentUnitId: this.currentUnitId,
      currentLessonId: this.currentLessonId,
      groupId: this.groupId,
      startedAt: this.startedAt.toISOString(),
      completedAt: this.completedAt?.toISOString() || null,
      timeSpentTotal: this.timeSpentTotal,
      isCompleted: this.isCompleted(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
