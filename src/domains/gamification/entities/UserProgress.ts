import type { Accuracy } from "@/domains/learning-path/value-objects/Accuracy";
import { DomainError, ValidationError } from "@/domains/shared/errors";
import {
  LessonId,
  type PathId,
  type UnitId,
  type UserId,
  UserProgressId,
} from "@/domains/shared/types/branded-types";
import {
  HeartsDepletedEvent,
  HeartsRefilledEvent,
  StreakBrokenEvent,
  StreakMilestoneEvent,
  XPEarnedEvent,
} from "../events/ProgressEvents";
import { Hearts } from "../value-objects/Hearts";
import { Streak } from "../value-objects/Streak";
import { XP } from "../value-objects/XP";

export interface LessonCompletionResult {
  xpEarned: XP;
  heartsRemaining: Hearts;
  streak: Streak;
  accuracy: Accuracy;
  leveledUp: boolean;
  streakMilestone: number | null;
}

export class UserProgress {
  private events: Array<
    | XPEarnedEvent
    | HeartsDepletedEvent
    | HeartsRefilledEvent
    | StreakBrokenEvent
    | StreakMilestoneEvent
  > = [];

  private constructor(
    public readonly id: UserProgressId,
    public readonly userId: UserId,
    public readonly pathId: PathId,
    private xp: XP,
    private hearts: Hearts,
    private streak: Streak,
    private currentUnitId: UnitId | null,
    private currentLessonId: LessonId | null,
    private lastHeartRefill: Date,
    public readonly createdAt: Date,
    private updatedAt: Date,
  ) {
    this.validate();
  }

  static createNew(userId: UserId, pathId: PathId): UserProgress {
    const now = new Date();
    return new UserProgress(
      UserProgressId(0), // ID assigned by repository
      userId,
      pathId,
      XP.zero(),
      Hearts.full(),
      Streak.zero(),
      null,
      null,
      now,
      now,
      now,
    );
  }

  static reconstitute(
    id: UserProgressId,
    userId: UserId,
    pathId: PathId,
    xpAmount: number,
    heartsCount: number,
    streakCount: number,
    streakLastActivity: Date | null,
    currentUnitId: UnitId | null,
    currentLessonId: LessonId | null,
    lastHeartRefill: Date,
    createdAt: Date,
    updatedAt: Date,
  ): UserProgress {
    return new UserProgress(
      id,
      userId,
      pathId,
      XP.fromAmount(xpAmount),
      Hearts.create(heartsCount),
      streakLastActivity
        ? Streak.fromCount(streakCount, streakLastActivity)
        : Streak.zero(),
      currentUnitId,
      currentLessonId,
      lastHeartRefill,
      createdAt,
      updatedAt,
    );
  }

  completeLesson(
    lessonId: LessonId,
    accuracy: Accuracy,
    xpEarned: XP,
    heartsRemaining: Hearts,
  ): LessonCompletionResult {
    const previousXP = this.xp;
    this.xp = this.xp.add(xpEarned);

    this.events.push(
      XPEarnedEvent.create(
        this.userId,
        this.pathId,
        xpEarned,
        "lesson",
        lessonId as number,
      ),
    );

    this.hearts = heartsRemaining;

    const previousStreak = this.streak.getCount();
    this.streak = this.streak.increment();
    const newStreak = this.streak.getCount();

    let streakMilestone: number | null = null;
    const milestones = [3, 7, 14, 30, 100];
    for (const milestone of milestones) {
      if (newStreak === milestone && previousStreak < milestone) {
        streakMilestone = milestone;
        const bonusXP = this.calculateStreakMilestoneBonus(milestone);
        this.xp = this.xp.add(bonusXP);

        this.events.push(
          StreakMilestoneEvent.create(
            this.userId,
            this.pathId,
            newStreak,
            milestone as 3 | 7 | 14 | 30 | 100,
            bonusXP,
          ),
        );
        break;
      }
    }

    this.currentLessonId = lessonId;

    const leveledUp = this.hasLeveledUp(previousXP, this.xp);

    this.updatedAt = new Date();

    return {
      xpEarned,
      heartsRemaining,
      streak: this.streak,
      accuracy,
      leveledUp,
      streakMilestone,
    };
  }

  advanceToLesson(lessonId: LessonId, unitId: UnitId): void {
    this.currentLessonId = lessonId;
    this.currentUnitId = unitId;
    this.updatedAt = new Date();
  }

  awardXP(
    amount: XP,
    source: "lesson" | "unit" | "streak" | "perfect",
    sourceId?: number,
  ): void {
    this.xp = this.xp.add(amount);
    this.events.push(
      XPEarnedEvent.create(
        this.userId,
        this.pathId,
        amount,
        source,
        sourceId ?? null,
      ),
    );
    this.updatedAt = new Date();
  }

  deductHeart(): void {
    this.hearts = this.hearts.deduct();

    if (this.hearts.isEmpty()) {
      this.events.push(
        HeartsDepletedEvent.create(
          this.userId,
          this.pathId,
          this.currentLessonId ?? LessonId(0),
        ),
      );
    }

    this.updatedAt = new Date();
  }

  refillHearts(
    reason: "daily" | "time" | "purchase" | "reward" = "time",
  ): void {
    const previousHearts = this.hearts.remaining();
    this.hearts = Hearts.full();
    const heartsRefilled = this.hearts.remaining() - previousHearts;

    if (heartsRefilled > 0) {
      this.events.push(
        HeartsRefilledEvent.create(
          this.userId,
          this.pathId,
          heartsRefilled,
          reason,
        ),
      );
    }

    this.lastHeartRefill = new Date();
    this.updatedAt = new Date();
  }

  breakStreak(): void {
    const previousCount = this.streak.getCount();

    if (previousCount > 0) {
      this.events.push(
        StreakBrokenEvent.create(this.userId, this.pathId, previousCount),
      );
    }

    this.streak = Streak.zero();
    this.updatedAt = new Date();
  }

  hasNoHearts(): boolean {
    return this.hearts.isEmpty();
  }

  canAffordHearts(cost: XP): boolean {
    return this.xp.isGreaterThan(cost) || this.xp.equals(cost);
  }

  purchaseHearts(cost: XP): void {
    if (!this.canAffordHearts(cost)) {
      throw new DomainError(
        "Insufficient XP to purchase hearts",
        "INSUFFICIENT_XP",
      );
    }

    this.xp = this.xp.subtract(cost);
    this.refillHearts("purchase");
  }

  getXP(): XP {
    return this.xp;
  }

  getHearts(): Hearts {
    return this.hearts;
  }

  getStreak(): Streak {
    return this.streak;
  }

  getCurrentUnitId(): UnitId | null {
    return this.currentUnitId;
  }

  getCurrentLessonId(): LessonId | null {
    return this.currentLessonId;
  }

  getLastHeartRefill(): Date {
    return new Date(this.lastHeartRefill);
  }

  getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }

  getLevel(): number {
    return Math.floor(this.xp.getAmount() / 100);
  }

  getXPToNextLevel(): number {
    const currentLevel = this.getLevel();
    const nextLevelXP = (currentLevel + 1) * 100;
    return nextLevelXP - this.xp.getAmount();
  }

  getEvents(): ReadonlyArray<
    | XPEarnedEvent
    | HeartsDepletedEvent
    | HeartsRefilledEvent
    | StreakBrokenEvent
    | StreakMilestoneEvent
  > {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  private hasLeveledUp(previousXP: XP, currentXP: XP): boolean {
    const previousLevel = Math.floor(previousXP.getAmount() / 100);
    const currentLevel = Math.floor(currentXP.getAmount() / 100);
    return currentLevel > previousLevel;
  }

  private calculateStreakMilestoneBonus(milestone: number): XP {
    switch (milestone) {
      case 3:
        return XP.fromAmount(10);
      case 7:
        return XP.fromAmount(20);
      case 14:
        return XP.fromAmount(30);
      case 30:
        return XP.fromAmount(50);
      case 100:
        return XP.fromAmount(100);
      default:
        return XP.zero();
    }
  }

  private validate(): void {
    if (!this.xp || !this.hearts || !this.streak) {
      throw new ValidationError(
        "UserProgress must have valid XP, Hearts, and Streak",
      );
    }
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      pathId: this.pathId,
      xp: this.xp.getAmount(),
      hearts: this.hearts.remaining(),
      streak: this.streak.getCount(),
      currentUnitId: this.currentUnitId,
      currentLessonId: this.currentLessonId,
      level: this.getLevel(),
      xpToNextLevel: this.getXPToNextLevel(),
      lastHeartRefill: this.lastHeartRefill.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
