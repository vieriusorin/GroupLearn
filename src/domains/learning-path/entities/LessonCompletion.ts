import type { Hearts } from "@/domains/gamification/value-objects/Hearts";
import type { XP } from "@/domains/gamification/value-objects/XP";
import { DomainError } from "@/domains/shared/errors";
import type {
  LessonCompletionId,
  LessonId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { Accuracy } from "../value-objects/Accuracy";

export class LessonCompletion {
  private constructor(
    private readonly id: LessonCompletionId | null,
    private readonly userId: UserId,
    private readonly lessonId: LessonId,
    private readonly completedAt: Date,
    private readonly xpEarned: XP,
    private readonly accuracy: Accuracy,
    private readonly timeSpentSeconds: number,
    private readonly heartsRemaining: Hearts,
    private readonly isPerfect: boolean,
  ) {
    this.validateInvariants();
  }

  static create(
    userId: UserId,
    lessonId: LessonId,
    accuracy: Accuracy,
    xpEarned: XP,
    timeSpentSeconds: number,
    heartsRemaining: Hearts,
    isPerfect: boolean,
  ): LessonCompletion {
    return new LessonCompletion(
      null, // No ID yet (will be assigned by repository)
      userId,
      lessonId,
      new Date(),
      xpEarned,
      accuracy,
      timeSpentSeconds,
      heartsRemaining,
      isPerfect,
    );
  }

  static reconstitute(
    id: LessonCompletionId,
    userId: UserId,
    lessonId: LessonId,
    completedAt: Date,
    xpEarned: XP,
    accuracy: Accuracy,
    timeSpentSeconds: number,
    heartsRemaining: Hearts,
    isPerfect: boolean,
  ): LessonCompletion {
    return new LessonCompletion(
      id,
      userId,
      lessonId,
      completedAt,
      xpEarned,
      accuracy,
      timeSpentSeconds,
      heartsRemaining,
      isPerfect,
    );
  }

  isNew(): boolean {
    return this.id === null;
  }

  getId(): LessonCompletionId | null {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getLessonId(): LessonId {
    return this.lessonId;
  }

  getCompletedAt(): Date {
    return new Date(this.completedAt);
  }

  getXPEarned(): XP {
    return this.xpEarned;
  }

  getAccuracy(): Accuracy {
    return this.accuracy;
  }

  getTimeSpentSeconds(): number {
    return this.timeSpentSeconds;
  }

  getHeartsRemaining(): Hearts {
    return this.heartsRemaining;
  }

  getIsPerfect(): boolean {
    return this.isPerfect;
  }

  getFormattedTimeSpent(): string {
    const minutes = Math.floor(this.timeSpentSeconds / 60);
    const seconds = this.timeSpentSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  isHighScore(): boolean {
    return this.accuracy.isAbove(90);
  }

  private validateInvariants(): void {
    if (this.timeSpentSeconds < 0) {
      throw new DomainError(
        "Time spent cannot be negative",
        "INVALID_TIME_SPENT",
      );
    }
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      lessonId: this.lessonId,
      completedAt: this.completedAt.toISOString(),
      xpEarned: this.xpEarned.getAmount(),
      accuracy: this.accuracy.getPercent(),
      timeSpentSeconds: this.timeSpentSeconds,
      timeSpentFormatted: this.getFormattedTimeSpent(),
      heartsRemaining: this.heartsRemaining.remaining(),
      isPerfect: this.isPerfect,
      isHighScore: this.isHighScore(),
    };
  }
}
