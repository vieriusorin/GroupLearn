import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { HeartRefillService } from "@/domains/gamification/services/HeartRefillService";
import { PathId, UserId } from "@/domains/shared/types/branded-types";

export interface RefillHeartsRequest {
  userId: string;
  pathId: number;
}

export interface RefillHeartsResponse {
  success: boolean;
  heartsBefore: number;
  heartsAfter: number;
  heartsRestored: number;
  nextRefillTime: string;
  refillProgress: number;
}

export class RefillHeartsUseCase {
  private readonly heartRefillService: HeartRefillService;

  constructor(
    private readonly userProgressRepository: IUserProgressRepository,
  ) {
    this.heartRefillService = new HeartRefillService();
  }

  async execute(request: RefillHeartsRequest): Promise<RefillHeartsResponse> {
    const userId = UserId(request.userId);
    const pathId = PathId(request.pathId);

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
