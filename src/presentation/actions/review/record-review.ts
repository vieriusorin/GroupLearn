"use server";

import { revalidateTag } from "next/cache";
import { SpacedRepetitionService } from "@/domains/review/services/SpacedRepetitionService";
import { FlashcardId, UserId } from "@/domains/shared/types/branded-types";
import { repositories } from "@/infrastructure/di/container";
import type { ReviewMode } from "@/lib/types";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function recordReview(
  flashcardId: number,
  reviewMode: ReviewMode,
  isCorrect: boolean,
): Promise<
  ActionResult<{
    id: number;
    flashcardId: number;
    reviewMode: ReviewMode;
    isCorrect: boolean;
    nextReviewDate: string;
    intervalDays: number;
  }>
> {
  return withAuth(["admin", "member"], async (user) => {
    if (!flashcardId || flashcardId <= 0) {
      return {
        success: false,
        error: "Invalid flashcard ID",
        code: "VALIDATION_ERROR",
      };
    }

    const flashcard = await repositories.flashcard.findById(
      FlashcardId(flashcardId),
    );
    if (!flashcard) {
      return {
        success: false,
        error: "Flashcard not found",
        code: "FLASHCARD_NOT_FOUND",
      };
    }

    const userId = UserId(user.id);
    const reviewHistory =
      await repositories.reviewHistory.findByUserAndFlashcard(
        userId,
        FlashcardId(flashcardId),
      );

    const spacedRepService = new SpacedRepetitionService();
    const historyRecords = reviewHistory.map((r) => ({
      isCorrect: r.isCorrect,
      reviewDate: r.reviewDate,
      intervalDays: r.intervalDays,
      reviewMode: r.reviewMode,
      userId: r.userId,
    }));

    const nextInterval = spacedRepService.calculateNextInterval(
      historyRecords,
      isCorrect,
    );
    const nextReviewDate = nextInterval.calculateNextReviewDate();

    const reviewRecord = {
      userId,
      flashcardId: FlashcardId(flashcardId),
      reviewMode,
      isCorrect,
      reviewDate: new Date(),
      nextReviewDate,
      intervalDays: nextInterval.getDays(),
    };

    const saved = await repositories.reviewHistory.save(reviewRecord);

    const {
      addToStrugglingQueue,
      removeFromStrugglingQueue,
      isCardStruggling,
    } = await import("@/lib/db-operations");

    if (!isCorrect) {
      const failureCount = reviewHistory.filter((r) => !r.isCorrect).length + 1;
      const totalAttempts = reviewHistory.length + 1;
      const shouldMark = spacedRepService.shouldMarkAsStruggling(
        failureCount,
        totalAttempts,
      );

      if (shouldMark) {
        await addToStrugglingQueue(flashcardId);
      }
    } else {
      const recentReviews = reviewHistory.slice(0, 2);
      const allCorrect = recentReviews.every((r) => r.isCorrect) && isCorrect;
      if (
        allCorrect &&
        recentReviews.length >= 1 &&
        (await isCardStruggling(flashcardId))
      ) {
        await removeFromStrugglingQueue(flashcardId);
      }
    }

    // Invalidate dashboard stats cache since review affects stats
    revalidateTag("dashboard-stats", { expire: 0 });

    return {
      success: true,
      data: {
        id: saved.id as number,
        flashcardId: saved.flashcardId as number,
        reviewMode: saved.reviewMode,
        isCorrect: saved.isCorrect,
        nextReviewDate: saved.nextReviewDate.toISOString(),
        intervalDays: saved.intervalDays,
      },
    };
  });
}
