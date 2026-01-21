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

/**
 * Result of completing a lesson
 */
export interface LessonCompletionResult {
  xpEarned: XP;
  heartsRemaining: Hearts;
  streak: Streak;
  accuracy: Accuracy;
  leveledUp: boolean;
  streakMilestone: number | null;
}

/**
 * UserProgress Entity
 *
 * Represents a user's progress through a specific learning path.
 * Manages XP, hearts, streaks, and current position in the path.
 *
 * Invariants:
 * - XP cannot be negative
 * - Hearts cannot be negative or exceed maximum
 * - Streak cannot be negative
 */
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

  /**
   * Create new user progress for a path
   */
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

  /**
   * Reconstitute from database
   */
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

  /**
   * Complete a lesson and update progress
   *
   * @param lessonId ID of completed lesson
   * @param accuracy Accuracy achieved
   * @param xpEarned XP earned from the lesson
   * @param heartsRemaining Hearts remaining after lesson
   * @returns Completion result with updated stats
   */
  completeLesson(
    lessonId: LessonId,
    accuracy: Accuracy,
    xpEarned: XP,
    heartsRemaining: Hearts,
  ): LessonCompletionResult {
    // Update XP
    const previousXP = this.xp;
    this.xp = this.xp.add(xpEarned);

    // Emit XP earned event
    this.events.push(
      XPEarnedEvent.create(
        this.userId,
        this.pathId,
        xpEarned,
        "lesson",
        lessonId as number,
      ),
    );

    // Update hearts
    this.hearts = heartsRemaining;

    // Update streak
    const previousStreak = this.streak.getCount();
    this.streak = this.streak.increment();
    const newStreak = this.streak.getCount();

    // Check for streak milestones
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

    // Update current lesson
    this.currentLessonId = lessonId;

    // Check if leveled up (every 100 XP)
    const leveledUp = this.hasLeveledUp(previousXP, this.xp);

    // Update timestamp
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

  /**
   * Advance to a new lesson within a unit
   */
  advanceToLesson(lessonId: LessonId, unitId: UnitId): void {
    this.currentLessonId = lessonId;
    this.currentUnitId = unitId;
    this.updatedAt = new Date();
  }

  /**
   * Award XP for a specific reason
   */
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

  /**
   * Deduct a heart (for incorrect answer)
   */
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

  /**
   * Refill hearts to maximum
   */
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

  /**
   * Break the current streak (missed a day)
   */
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

  /**
   * Check if hearts are depleted
   */
  hasNoHearts(): boolean {
    return this.hearts.isEmpty();
  }

  /**
   * Check if can afford hearts (for purchase)
   */
  canAffordHearts(cost: XP): boolean {
    return this.xp.isGreaterThan(cost) || this.xp.equals(cost);
  }

  /**
   * Purchase hearts with XP
   */
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

  // Getters

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
    // Every 100 XP = 1 level
    return Math.floor(this.xp.getAmount() / 100);
  }

  getXPToNextLevel(): number {
    const currentLevel = this.getLevel();
    const nextLevelXP = (currentLevel + 1) * 100;
    return nextLevelXP - this.xp.getAmount();
  }

  /**
   * Get all domain events
   */
  getEvents(): ReadonlyArray<
    | XPEarnedEvent
    | HeartsDepletedEvent
    | HeartsRefilledEvent
    | StreakBrokenEvent
    | StreakMilestoneEvent
  > {
    return [...this.events];
  }

  /**
   * Clear events (after they've been published)
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Check if user leveled up
   */
  private hasLeveledUp(previousXP: XP, currentXP: XP): boolean {
    const previousLevel = Math.floor(previousXP.getAmount() / 100);
    const currentLevel = Math.floor(currentXP.getAmount() / 100);
    return currentLevel > previousLevel;
  }

  /**
   * Calculate bonus XP for streak milestone
   */
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

  /**
   * Validate invariants
   */
  private validate(): void {
    // XP, Hearts, and Streak have their own validation in their value objects
    // Just verify they exist
    if (!this.xp || !this.hearts || !this.streak) {
      throw new ValidationError(
        "UserProgress must have valid XP, Hearts, and Streak",
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
