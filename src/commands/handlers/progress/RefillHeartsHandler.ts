import type { RefillHeartsResult } from "@/application/dtos/gamification.dto";
import type { RefillHeartsCommand } from "@/commands/progress/RefillHearts.command";
import type { ICommandHandler } from "@/commands/types";
import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { HeartRefillService } from "@/domains/gamification/services/HeartRefillService";
import { PathId, UserId } from "@/domains/shared/types/branded-types";

export class RefillHeartsHandler
  implements ICommandHandler<RefillHeartsCommand, RefillHeartsResult>
{
  private readonly heartRefillService: HeartRefillService;

  constructor(
    private readonly userProgressRepository: IUserProgressRepository,
  ) {
    this.heartRefillService = new HeartRefillService();
  }

  async execute(command: RefillHeartsCommand): Promise<RefillHeartsResult> {
    const userId = UserId(command.userId);
    const pathId = PathId(command.pathId);

    let userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );
    if (!userProgress) {
      userProgress = UserProgress.start(userId, pathId);
    }

    const heartsBefore = userProgress.getHearts().remaining();
    const lastRefill = userProgress.getLastHeartRefill();

    const _canRefill = this.heartRefillService.canRefillHearts(lastRefill);
    const nextRefillTime =
      this.heartRefillService.getNextRefillTime(lastRefill);
    const refillProgress =
      this.heartRefillService.getRefillProgress(lastRefill);

    userProgress.refillHearts();

    const heartsAfter = userProgress.getHearts().remaining();
    const heartsRestored = heartsAfter - heartsBefore;

    await this.userProgressRepository.save(userProgress);

    return {
      success: true,
      heartsBefore,
      heartsAfter,
      heartsRestored,
      nextRefillTime: nextRefillTime.toISOString(),
      refillProgress,
    };
  }
}
