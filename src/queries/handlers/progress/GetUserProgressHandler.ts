import type { GetUserProgressResult } from "@/application/dtos/gamification.dto";
import type { IQueryHandler } from "@/commands/types";
import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { PathId, UserId } from "@/domains/shared/types/branded-types";
import type { GetUserProgressQuery } from "@/queries/progress/GetUserProgress.query";

export class GetUserProgressHandler
  implements IQueryHandler<GetUserProgressQuery, GetUserProgressResult>
{
  constructor(
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(query: GetUserProgressQuery): Promise<GetUserProgressResult> {
    const userId = UserId(query.userId);
    const pathId = PathId(query.pathId);

    let userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );

    if (!userProgress) {
      userProgress = UserProgress.start(userId, pathId);
      await this.userProgressRepository.save(userProgress);
    }

    return {
      progress: {
        id: userProgress.getId() as number | null,
        userId: userProgress.getUserId() as string,
        pathId: userProgress.getPathId() as number,
        totalXP: userProgress.getXP().getAmount(),
        level: userProgress.getLevel(),
        xpToNextLevel: userProgress.getXPToNextLevel(),
        hearts: userProgress.getHearts().remaining(),
        maxHearts: 5,
        streakCount: userProgress.getStreak().getCount(),
        lastHeartRefill: userProgress.getLastHeartRefill().toISOString(),
        lastActivityDate:
          userProgress.getLastActivityDate()?.toISOString() || null,
        currentUnitId: userProgress.getCurrentUnitId() as number | null,
        currentLessonId: userProgress.getCurrentLessonId() as number | null,
        startedAt: userProgress.getStartedAt().toISOString(),
        completedAt: userProgress.getCompletedAt()?.toISOString() || null,
        timeSpentTotal: userProgress.getTimeSpentTotal(),
        isCompleted: userProgress.isCompleted(),
      },
    };
  }
}
