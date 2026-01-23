import type { SubmitReviewResult } from "@/application/dtos/review.dto";
import type { SubmitReviewCommand } from "@/commands/review/SubmitReview.command";
import type { ICommandHandler } from "@/commands/types";
import type { IReviewHistoryRepository } from "@/domains/review/repositories/IReviewHistoryRepository";
import { SpacedRepetitionService } from "@/domains/review/services/SpacedRepetitionService";
import { FlashcardId, UserId } from "@/domains/shared/types/branded-types";

export class SubmitReviewHandler
  implements ICommandHandler<SubmitReviewCommand, SubmitReviewResult>
{
  constructor(
    private readonly reviewHistoryRepository: IReviewHistoryRepository,
  ) {}

  async execute(command: SubmitReviewCommand): Promise<SubmitReviewResult> {
    const userId = UserId(command.userId);
    const flashcardId = FlashcardId(command.flashcardId);

    const reviewHistory =
      await this.reviewHistoryRepository.findByUserAndFlashcard(
        userId,
        flashcardId,
      );

    const spacedRepService = new SpacedRepetitionService();

    const historyRecords = reviewHistory.map((r) => ({
      isCorrect: r.isCorrect,
      reviewDate: r.reviewDate,
      intervalDays: r.intervalDays,
    }));

    const nextInterval = spacedRepService.calculateNextInterval(
      historyRecords,
      command.isCorrect,
    );
    const nextReviewDate = nextInterval.calculateNextReviewDate();

    const reviewRecord = {
      userId,
      flashcardId,
      reviewMode: "flashcard" as const,
      isCorrect: command.isCorrect,
      reviewDate: new Date(),
      nextReviewDate,
      intervalDays: nextInterval.getDays(),
    };

    await this.reviewHistoryRepository.save(reviewRecord);

    let event: "mastered" | "struggled" | "marked_struggling" =
      command.isCorrect ? "mastered" : "struggled";

    if (!command.isCorrect) {
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
              correctCount: command.isCorrect
                ? progress.reviewed
                : progress.reviewed - 1,
              accuracyPercent: command.isCorrect
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
