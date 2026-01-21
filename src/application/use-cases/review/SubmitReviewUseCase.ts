import type { ISessionRepository } from "@/domains/learning-path/repositories/ISessionRepository";
import type { IReviewHistoryRepository } from "@/domains/review/repositories/IReviewHistoryRepository";
import { FlashcardId, UserId } from "@/domains/shared/types/branded-types";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";

export interface SubmitReviewRequest {
  userId: string;
  sessionId: string;
  flashcardId: number;
  isCorrect: boolean;
}

export interface SubmitReviewResponse {
  result: "advanced" | "completed";
  event: "mastered" | "struggled" | "marked_struggling";
  nextReviewDate: string;
  intervalDays: number;
  progress: {
    reviewed: number;
    total: number;
    percent: number;
  };
  nextCard?: {
    id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
  };
  sessionComplete?: {
    totalReviewed: number;
    correctCount: number;
    accuracyPercent: number;
  };
}

export class SubmitReviewUseCase {
  constructor(
    private readonly reviewHistoryRepository: IReviewHistoryRepository,
    readonly _sessionRepository: ISessionRepository,
  ) {}

  async execute(request: SubmitReviewRequest): Promise<SubmitReviewResponse> {
    const userId = UserId(request.userId);
    const flashcardId = FlashcardId(request.flashcardId);

    // TODO: Load session from in-memory cache or repository
    // For now, we'll need to reconstruct the session or use a session repository
    // This is a placeholder - in a real implementation, you'd load the session
    // const session = await this.sessionRepository.findBySessionId(request.sessionId);
    // if (!session) {
    //   throw new DomainError('Review session not found', 'SESSION_NOT_FOUND');
    // }

    // For now, we'll work directly with the review history
    // Load review history for this card
    const reviewHistory =
      await this.reviewHistoryRepository.findByUserAndFlashcard(
        userId,
        flashcardId,
      );

    const { SpacedRepetitionService } = await import(
      "@/domains/review/services/SpacedRepetitionService"
    );
    const spacedRepService = new SpacedRepetitionService();

    const historyRecords = reviewHistory.map((r) => ({
      isCorrect: r.isCorrect,
      reviewDate: r.reviewDate,
      intervalDays: r.intervalDays,
    }));

    const nextInterval = spacedRepService.calculateNextInterval(
      historyRecords,
      request.isCorrect,
    );
    const nextReviewDate = nextInterval.calculateNextReviewDate();

    const reviewRecord = {
      userId,
      flashcardId,
      reviewMode: "flashcard" as const,
      isCorrect: request.isCorrect,
      reviewDate: new Date(),
      nextReviewDate,
      intervalDays: nextInterval.getDays(),
    };

    await this.reviewHistoryRepository.save(reviewRecord);

    let event: "mastered" | "struggled" | "marked_struggling" =
      request.isCorrect ? "mastered" : "struggled";

    if (!request.isCorrect) {
      const failureCount = this.countConsecutiveFailures(reviewHistory);
      const totalAttempts = reviewHistory.length + 1;
      const shouldMark = spacedRepService.shouldMarkAsStruggling(
        failureCount,
        totalAttempts,
      );

      if (shouldMark) {
        event = "marked_struggling";
        await this.addToStrugglingQueue(flashcardId);
      }
    } else {
      await this.removeFromStrugglingQueue(flashcardId);
    }

    const progress = {
      reviewed: reviewHistory.length + 1,
      total: 10,
      percent: Math.round(((reviewHistory.length + 1) / 10) * 100),
    };

    return {
      result: progress.reviewed >= progress.total ? "completed" : "advanced",
      event,
      nextReviewDate: nextReviewDate.toISOString(),
      intervalDays: nextInterval.getDays(),
      progress,
      sessionComplete:
        progress.reviewed >= progress.total
          ? {
              totalReviewed: progress.reviewed,
              correctCount: request.isCorrect
                ? progress.reviewed
                : progress.reviewed - 1,
              accuracyPercent: request.isCorrect
                ? 100
                : Math.round(
                    ((progress.reviewed - 1) / progress.reviewed) * 100,
                  ),
            }
          : undefined,
    };
  }

  private countConsecutiveFailures(
    reviewHistory: Array<{ isCorrect: boolean }>,
  ): number {
    let count = 0;
    for (let i = reviewHistory.length - 1; i >= 0; i--) {
      if (!reviewHistory[i].isCorrect) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private async addToStrugglingQueue(flashcardId: FlashcardId): Promise<void> {
    const { db } = await import("@/infrastructure/database/drizzle");
    const { strugglingQueue } = await import(
      "@/infrastructure/database/schema"
    );
    const { eq } = await import("drizzle-orm");

    const [existing] = await db
      .select()
      .from(strugglingQueue)
      .where(eq(strugglingQueue.flashcardId, flashcardId as number))
      .limit(1);

    if (existing) {
      await db
        .update(strugglingQueue)
        .set({
          timesFailed: existing.timesFailed + 1,
          lastFailedAt: new Date(),
        })
        .where(eq(strugglingQueue.flashcardId, flashcardId as number));
    } else {
      await db.insert(strugglingQueue).values({
        flashcardId: flashcardId as number,
        timesFailed: 1,
        lastFailedAt: new Date(),
      });
    }
  }

  private async removeFromStrugglingQueue(
    flashcardId: FlashcardId,
  ): Promise<void> {
    const { db } = await import("@/infrastructure/database/drizzle");
    const { strugglingQueue } = await import(
      "@/infrastructure/database/schema"
    );
    const { eq } = await import("drizzle-orm");

    await db
      .delete(strugglingQueue)
      .where(eq(strugglingQueue.flashcardId, flashcardId as number));
  }
}
