import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import type { XP } from "@/domains/gamification/value-objects/XP";
import { LessonCompletion } from "@/domains/learning-path/entities/LessonCompletion";
import type { ILessonCompletionRepository } from "@/domains/learning-path/repositories/ILessonCompletionRepository";
import type { ISessionRepository } from "@/domains/learning-path/repositories/ISessionRepository";
import { XPCalculationService } from "@/domains/learning-path/services";
import { Accuracy } from "@/domains/learning-path/value-objects/Accuracy";
import { DomainError } from "@/domains/shared/errors";
import { LessonId, PathId, UserId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for completing a lesson
 */
export interface CompleteLessonRequest {
  userId: string;
  lessonId: number;
  pathId: number;
  // Session data (in a real app, you'd load this from cache/repository)
  accuracy: number;
  heartsRemaining: number;
  cardsReviewed: number;
  isPerfect: boolean;
  timeSpentSeconds: number;
}

/**
 * Response DTO for lesson completion
 */
export interface CompleteLessonResponse {
  success: boolean;
  data: {
    lessonId: number;
    accuracy: number;
    xpEarned: number;
    heartsRemaining: number;
    isPerfect: boolean;
    cardsReviewed: number;
    timeSpentSeconds: number;
    rewards: {
      baseXP: number;
      accuracyBonus: number;
      perfectBonus: number;
      totalXP: number;
    };
    userProgress: {
      totalXP: number;
      level: number;
      heartsRefilled: boolean;
    };
  };
}

/**
 * CompleteLessonUseCase
 *
 * Application service that handles the full completion of a lesson.
 * This use case is called after the last answer is submitted successfully.
 *
 * Flow:
 * 1. Load and validate the lesson session is complete
 * 2. Calculate XP earned using XPCalculationService
 * 3. Update user progress (XP, streak, level)
 * 4. Refill hearts after completion
 * 5. Record lesson completion in history
 * 6. Delete session
 * 7. Return completion summary
 *
 * Business Rules:
 * - Lesson must be completed (all cards reviewed)
 * - Minimum accuracy required: 60% (configurable)
 * - Perfect lesson (100% accuracy, no mistakes) earns bonus XP
 * - Hearts refill after lesson completion
 * - Streak updates after completing first lesson of the day
 * - Level up at every 100 XP
 */
export class CompleteLessonUseCase {
  private readonly xpService: XPCalculationService;
  private readonly baseXPReward = 10; // TODO: Get from lesson config
  private readonly minimumAccuracy = 60; // TODO: Get from path/lesson config

  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly lessonCompletionRepository: ILessonCompletionRepository,
    private readonly userProgressRepository: IUserProgressRepository,
  ) {
    this.xpService = new XPCalculationService();
  }

  async execute(
    request: CompleteLessonRequest,
  ): Promise<CompleteLessonResponse> {
    // Convert primitives to branded types
    const userId = UserId(request.userId);
    const lessonId = LessonId(request.lessonId);
    const pathId = PathId(request.pathId);

    // Load lesson session from repository
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

    // Get accuracy from session
    const accuracy = session.getAccuracy();
    const accuracyPercent = accuracy.getPercent();

    // Validate lesson completion
    if (accuracyPercent < this.minimumAccuracy) {
      throw new DomainError(
        `Lesson requires minimum ${this.minimumAccuracy}% accuracy to pass`,
        "LESSON_MINIMUM_ACCURACY_NOT_MET",
      );
    }

    // Calculate XP earned
    const xpCalculation = this.calculateXP({
      accuracy: accuracyPercent,
      isPerfect: session.isPerfect(),
    });

    // Load user progress from repository
    let userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );
    if (!userProgress) {
      // Create new progress if it doesn't exist
      userProgress = UserProgress.start(userId, pathId);
    }

    // Update user progress aggregate
    userProgress.completeLesson(
      lessonId,
      accuracy,
      xpCalculation.totalXP,
      session.getHearts(),
    );
    userProgress.refillHearts(); // Refill hearts after lesson completion

    // Save updated user progress
    await this.userProgressRepository.save(userProgress);

    // Record lesson completion in history
    const completion = LessonCompletion.create(
      userId,
      lessonId,
      accuracy,
      xpCalculation.totalXP,
      request.timeSpentSeconds,
      session.getHearts(),
      request.isPerfect,
    );
    await this.lessonCompletionRepository.save(completion);

    // Delete session
    await this.sessionRepository.delete(userId, lessonId);

    // TODO: Publish domain events
    // const events = userProgress.getEvents();
    // await this.eventPublisher.publishAll(events);
    // userProgress.clearEvents();

    // Get updated progress data
    const totalXP = userProgress.getXP().getAmount();
    const level = userProgress.getLevel();

    // Return completion summary
    return {
      success: true,
      data: {
        lessonId: request.lessonId,
        accuracy: accuracyPercent,
        xpEarned: xpCalculation.totalXP.getAmount(),
        heartsRemaining: session.getHearts().remaining(),
        isPerfect: request.isPerfect,
        cardsReviewed: session.getAnswers().length,
        timeSpentSeconds: request.timeSpentSeconds,
        rewards: {
          baseXP: this.baseXPReward,
          accuracyBonus: xpCalculation.accuracyBonus,
          perfectBonus: xpCalculation.perfectBonus,
          totalXP: xpCalculation.totalXP.getAmount(),
        },
        userProgress: {
          totalXP,
          level,
          heartsRefilled: true,
        },
      },
    };
  }

  /**
   * Calculate XP earned from lesson completion
   */
  private calculateXP(request: { accuracy: number; isPerfect: boolean }): {
    totalXP: XP;
    accuracyBonus: number;
    perfectBonus: number;
  } {
    const accuracy = Accuracy.fromPercent(request.accuracy);

    // Calculate base XP with accuracy bonus
    const baseXP = this.xpService.calculateLessonXP(
      this.baseXPReward,
      accuracy,
      request.isPerfect,
    );

    // Calculate bonuses separately for display
    let accuracyBonus = 0;
    if (accuracy.isPerfect()) {
      accuracyBonus = 15;
    } else if (accuracy.isAbove(90)) {
      accuracyBonus = 10;
    } else if (accuracy.isAbove(80)) {
      accuracyBonus = 5;
    }

    const perfectBonus = request.isPerfect && accuracy.isPerfect() ? 10 : 0;

    return {
      totalXP: baseXP,
      accuracyBonus,
      perfectBonus,
    };
  }
}

/**
 * EXAMPLE USAGE IN API ROUTE:
 *
 * // src/app/api/lessons/[id]/complete/route.ts
 * export async function POST(
 *   request: Request,
 *   { params }: { params: { id: string } }
 * ) {
 *   const body = await request.json();
 *
 *   const useCase = new CompleteLessonUseCase();
 *   const result = await useCase.execute({
 *     userId: body.userId,
 *     lessonId: parseInt(params.id),
 *     pathId: body.pathId,
 *     accuracy: body.accuracy,
 *     heartsRemaining: body.heartsRemaining,
 *     cardsReviewed: body.cardsReviewed,
 *     isPerfect: body.isPerfect,
 *     timeSpentSeconds: body.timeSpentSeconds,
 *   });
 *
 *   return NextResponse.json(result);
 * }
 *
 * EXAMPLE RESPONSE:
 * {
 *   "success": true,
 *   "data": {
 *     "lessonId": 1,
 *     "accuracy": 95,
 *     "xpEarned": 35,
 *     "heartsRemaining": 4,
 *     "isPerfect": false,
 *     "cardsReviewed": 10,
 *     "timeSpentSeconds": 180,
 *     "rewards": {
 *       "baseXP": 10,
 *       "accuracyBonus": 10,
 *       "perfectBonus": 0,
 *       "totalXP": 35
 *     },
 *     "userProgress": {
 *       "totalXP": 385,
 *       "level": 3,
 *       "heartsRefilled": true
 *     }
 *   }
 * }
 */
