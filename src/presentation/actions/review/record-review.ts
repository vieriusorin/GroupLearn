"use server";

import { revalidateTag } from "next/cache";
import type { RecordReviewResult } from "@/application/dtos/review.dto";
import { SpacedRepetitionService } from "@/domains/review/services/SpacedRepetitionService";
import { FlashcardId, UserId } from "@/domains/shared/types/branded-types";
import type { ReviewModeType } from "@/infrastructure/database/schema";
import { repositories } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function recordReview(
  flashcardId: number,
  reviewMode: ReviewModeType,
  isCorrect: boolean,
): Promise<ActionResult<RecordReviewResult>> {
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

    // Convert ReviewModeType to domain ReviewMode
    const domainReviewMode: "flashcard" | "quiz" | "recall" =
      reviewMode === "learn"
        ? "flashcard"
        : reviewMode === "review"
          ? "quiz"
          : "recall";

    const reviewRecord = {
      userId,
      flashcardId: FlashcardId(flashcardId),
      reviewMode: domainReviewMode,
      isCorrect,
      reviewDate: new Date(),
      nextReviewDate,
      intervalDays: nextInterval.getDays(),
    };

    const saved = await repositories.reviewHistory.save(reviewRecord);

    const { commandHandlers, queryHandlers } = await import(
      "@/infrastructure/di/container"
    );
    const { addToStrugglingQueueCommand, removeFromStrugglingQueueCommand } =
      await import("@/commands");
    const { isCardStrugglingQuery } = await import("@/queries");

    if (!isCorrect) {
      const failureCount = reviewHistory.filter((r) => !r.isCorrect).length + 1;
      const totalAttempts = reviewHistory.length + 1;
      const shouldMark = spacedRepService.shouldMarkAsStruggling(
        failureCount,
        totalAttempts,
      );

      if (shouldMark) {
        const command = addToStrugglingQueueCommand(flashcardId);
        await commandHandlers.review.addToStrugglingQueue.execute(command);
      }
    } else {
      const recentReviews = reviewHistory.slice(0, 2);
      const allCorrect = recentReviews.every((r) => r.isCorrect) && isCorrect;
      if (allCorrect && recentReviews.length >= 1) {
        const query = isCardStrugglingQuery(flashcardId);
        const isStruggling =
          await queryHandlers.review.isCardStruggling.execute(query);
        if (isStruggling) {
          const command = removeFromStrugglingQueueCommand(flashcardId);
          await commandHandlers.review.removeFromStrugglingQueue.execute(
            command,
          );
        }
      }
    }

    // Invalidate dashboard stats cache since review affects stats
    revalidateTag("dashboard-stats", { expire: 0 });

    // Convert domain ReviewMode to response format
    const responseReviewMode: RecordReviewResult["reviewMode"] =
      saved.reviewMode === "flashcard"
        ? "learn"
        : saved.reviewMode === "quiz"
          ? "review"
          : "cram";

    return {
      success: true,
      data: {
        id: saved.id as number,
        flashcardId: saved.flashcardId as number,
        reviewMode: responseReviewMode,
        isCorrect: saved.isCorrect,
        nextReviewDate: saved.nextReviewDate.toISOString(),
        intervalDays: saved.intervalDays,
      },
    };
  });
}
