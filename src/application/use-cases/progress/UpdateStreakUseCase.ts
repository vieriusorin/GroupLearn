import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { PathId, UserId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for updating streak
 */
export interface UpdateStreakRequest {
  userId: string;
  pathId: number;
}

/**
 * Response DTO for streak update
 */
export interface UpdateStreakResponse {
  success: boolean;
  streakCount: number;
  previousStreakCount: number;
  streakBroken: boolean;
  lastActivityDate: string;
}

/**
 * UpdateStreakUseCase
 *
 * Application service that updates daily streak.
 *
 * Flow:
 * 1. Load UserProgress
 * 2. Check if activity today
 * 3. Increment or break streak
 * 4. Save and emit events
 */
export class UpdateStreakUseCase {
  constructor(
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(request: UpdateStreakRequest): Promise<UpdateStreakResponse> {
    const userId = UserId(request.userId);
    const pathId = PathId(request.pathId);

    // Load user progress
    let userProgress = await this.userProgressRepository.findByUserAndPath(
      userId,
      pathId,
    );
    if (!userProgress) {
      userProgress = UserProgress.start(userId, pathId);
    }

    const previousStreakCount = userProgress.getStreak().getCount();

    // Update streak (this method handles the logic internally)
    userProgress.updateStreak();

    const newStreakCount = userProgress.getStreak().getCount();
    const streakBroken = newStreakCount < previousStreakCount;
    const lastActivityDate = userProgress.getLastActivityDate();

    // Save updated progress
    await this.userProgressRepository.save(userProgress);

    // TODO: Publish domain events
    // const events = userProgress.getEvents();
    // await this.eventPublisher.publishAll(events);
    // userProgress.clearEvents();

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
