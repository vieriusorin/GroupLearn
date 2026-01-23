import type { GetLessonProgressResult } from "@/application/dtos/learning-path.dto";
import type { IQueryHandler } from "@/commands/types";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import type { ILessonCompletionRepository } from "@/domains/learning-path/repositories/ILessonCompletionRepository";
import type { ILessonRepository } from "@/domains/learning-path/repositories/ILessonRepository";
import { DomainError } from "@/domains/shared/errors";
import { LessonId, PathId, UserId } from "@/domains/shared/types/branded-types";
import type { GetLessonProgressQuery } from "@/queries/lesson/GetLessonProgress.query";

export class GetLessonProgressHandler
  implements IQueryHandler<GetLessonProgressQuery, GetLessonProgressResult>
{
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly lessonCompletionRepository: ILessonCompletionRepository,
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(
    query: GetLessonProgressQuery,
  ): Promise<GetLessonProgressResult> {
    const userId = UserId(query.userId);
    const lessonId = LessonId(query.lessonId);
    const pathId = PathId(query.pathId);

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) {
      throw new DomainError("Lesson not found", "LESSON_NOT_FOUND");
    }

    const userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );

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
