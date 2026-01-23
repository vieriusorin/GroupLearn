import type { CompleteLessonResult } from "@/application/dtos/learning-path.dto";
import type { CompleteLessonCommand } from "@/commands/lesson/CompleteLesson.command";
import type { ICommandHandler } from "@/commands/types";
import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { LessonCompletion } from "@/domains/learning-path/entities/LessonCompletion";
import type { ILessonCompletionRepository } from "@/domains/learning-path/repositories/ILessonCompletionRepository";
import type { ISessionRepository } from "@/domains/learning-path/repositories/ISessionRepository";
import { XPCalculationService } from "@/domains/learning-path/services";
import { DomainError } from "@/domains/shared/errors";
import { LessonId, PathId, UserId } from "@/domains/shared/types/branded-types";

export class CompleteLessonHandler
  implements ICommandHandler<CompleteLessonCommand, CompleteLessonResult>
{
  private readonly xpService: XPCalculationService;
  private readonly baseXPReward = 10;
  private readonly minimumAccuracy = 60;

  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly lessonCompletionRepository: ILessonCompletionRepository,
    private readonly userProgressRepository: IUserProgressRepository,
  ) {
    this.xpService = new XPCalculationService();
  }

  async execute(command: CompleteLessonCommand): Promise<CompleteLessonResult> {
    const userId = UserId(command.userId);
    const lessonId = LessonId(command.lessonId);
    const pathId = PathId(command.pathId);

    const session = await this.sessionRepository.findByUserAndLesson(
      userId,
      lessonId,
    );
    if (!session) {
      throw new DomainError("No active session found", "SESSION_NOT_FOUND");
    }

    if (!session.isComplete()) {
      throw new DomainError("Lesson is not complete", "LESSON_NOT_COMPLETE");
    }

    const accuracy = session.getAccuracy();
    const accuracyPercent = accuracy.getPercent();

    if (accuracyPercent < this.minimumAccuracy) {
      throw new DomainError(
        `Lesson requires minimum ${this.minimumAccuracy}% accuracy to pass`,
        "LESSON_MINIMUM_ACCURACY_NOT_MET",
      );
    }

    const xpCalculation = this.calculateXP({
      accuracy: accuracyPercent,
      isPerfect: session.isPerfect(),
    });

    let userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );
    if (!userProgress) {
      userProgress = UserProgress.start(userId, pathId);
    }

    userProgress.completeLesson(
      lessonId,
      accuracy,
      xpCalculation.totalXP,
      session.getHearts(),
    );
    userProgress.refillHearts();

    await this.userProgressRepository.save(userProgress);

    const completion = LessonCompletion.create(
      userId,
      lessonId,
      accuracy,
      xpCalculation.totalXP,
      command.timeSpentSeconds,
      session.getHearts(),
      command.isPerfect,
    );
    await this.lessonCompletionRepository.save(completion);

    await this.sessionRepository.delete(userId, lessonId);

    const totalXP = userProgress.getXP().getAmount();
    const level = userProgress.getLevel();

    return {
      lessonId: command.lessonId,
      accuracy: accuracyPercent,
      xpEarned: xpCalculation.totalXP,
      heartsRemaining: session.getHearts(),
      isPerfect: session.isPerfect(),
      cardsReviewed: command.cardsReviewed,
      timeSpentSeconds: command.timeSpentSeconds,
      rewards: {
        baseXP: xpCalculation.baseXP,
        accuracyBonus: xpCalculation.accuracyBonus,
        perfectBonus: xpCalculation.perfectBonus,
        totalXP: xpCalculation.totalXP,
      },
      userProgress: {
        totalXP,
        level,
        heartsRefilled: true,
      },
    };
  }

  private calculateXP(params: { accuracy: number; isPerfect: boolean }): {
    baseXP: number;
    accuracyBonus: number;
    perfectBonus: number;
    totalXP: number;
  } {
    const baseXP = this.baseXPReward;
    const accuracyBonus = this.xpService.calculateAccuracyBonus(
      baseXP,
      params.accuracy,
    );
    const perfectBonus = params.isPerfect
      ? this.xpService.calculatePerfectBonus(baseXP)
      : 0;
    const totalXP = baseXP + accuracyBonus + perfectBonus;

    return {
      baseXP,
      accuracyBonus,
      perfectBonus,
      totalXP,
    };
  }
}
