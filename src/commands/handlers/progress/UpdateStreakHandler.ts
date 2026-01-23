import type { UpdateStreakResult } from "@/application/dtos/gamification.dto";
import type { UpdateStreakCommand } from "@/commands/progress/UpdateStreak.command";
import type { ICommandHandler } from "@/commands/types";
import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { PathId, UserId } from "@/domains/shared/types/branded-types";

export class UpdateStreakHandler
  implements ICommandHandler<UpdateStreakCommand, UpdateStreakResult>
{
  constructor(
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(command: UpdateStreakCommand): Promise<UpdateStreakResult> {
    const userId = UserId(command.userId);
    const pathId = PathId(command.pathId);

    let userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );
    if (!userProgress) {
      userProgress = UserProgress.start(userId, pathId);
    }

    const previousStreakCount = userProgress.getStreak().getCount();

    userProgress.updateStreak();

    const newStreakCount = userProgress.getStreak().getCount();
    const streakBroken = newStreakCount < previousStreakCount;
    const lastActivityDate = userProgress.getLastActivityDate();

    await this.userProgressRepository.save(userProgress);

    return {
      success: true,
      streakCount: newStreakCount,
      previousStreakCount,
      streakBroken,
      lastActivityDate:
        lastActivityDate?.toISOString() || new Date().toISOString(),
    };
  }
}
