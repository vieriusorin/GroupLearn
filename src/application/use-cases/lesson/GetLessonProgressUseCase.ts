import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import type { ILessonCompletionRepository } from "@/domains/learning-path/repositories/ILessonCompletionRepository";
import type { ILessonRepository } from "@/domains/learning-path/repositories/ILessonRepository";
import { DomainError } from "@/domains/shared/errors";
import { LessonId, PathId, UserId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for getting lesson progress
 */
export interface GetLessonProgressRequest {
  userId: string;
  lessonId: number;
  pathId: number;
}

/**
 * Response DTO for lesson progress
 */
export interface GetLessonProgressResponse {
  lesson: {
    id: number;
    name: string;
    description: string | null;
    xpReward: number;
    flashcardCount: number;
  };
  progress: {
    completed: boolean;
    completionCount: number;
    bestAccuracy: number | null;
    lastCompletedAt: string | null;
    averageAccuracy: number | null;
  };
  userProgress: {
    totalXP: number;
    level: number;
    hearts: number;
  };
}

/**
 * GetLessonProgressUseCase
 *
 * Application service that gets current progress for a lesson.
 *
 * Flow:
 * 1. Load lesson by ID
 * 2. Load user progress
 * 3. Load lesson completion history
 * 4. Calculate completion %
 * 5. Return DTO
 */
export class GetLessonProgressUseCase {
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly lessonCompletionRepository: ILessonCompletionRepository,
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(
    request: GetLessonProgressRequest,
  ): Promise<GetLessonProgressResponse> {
    const userId = UserId(request.userId);
    const lessonId = LessonId(request.lessonId);
    const pathId = PathId(request.pathId);

    // Load lesson
    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new DomainError("Lesson not found", "LESSON_NOT_FOUND");
    }

    // Load user progress
    const userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );

    // Load lesson completion history
    const completions =
      await this.lessonCompletionRepository.findByUserAndLesson(
        userId,
        lessonId,
      );
    const bestCompletion =
      await this.lessonCompletionRepository.findBestCompletion(
        userId,
        lessonId,
      );
    const averageAccuracy =
      await this.lessonCompletionRepository.calculateAverageAccuracy(userId);

    const lastCompletion = completions.length > 0 ? completions[0] : null;

    return {
      lesson: {
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        xpReward: lesson.xpReward,
        flashcardCount: lesson.flashcardCount,
      },
      progress: {
        completed: completions.length > 0,
        completionCount: completions.length,
        bestAccuracy: bestCompletion
          ? bestCompletion.getAccuracy().getPercent()
          : null,
        lastCompletedAt: lastCompletion
          ? lastCompletion.getCompletedAt().toISOString()
          : null,
        averageAccuracy: averageAccuracy,
      },
      userProgress: {
        totalXP: userProgress ? userProgress.getXP().getAmount() : 0,
        level: userProgress ? userProgress.getLevel() : 0,
        hearts: userProgress ? userProgress.getHearts().remaining() : 5,
      },
    };
  }
}
