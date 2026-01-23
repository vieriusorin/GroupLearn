import { and, desc, eq, lte, sql } from "drizzle-orm";
import type { IReviewHistoryRepository } from "@/domains/review/repositories/IReviewHistoryRepository";
import type { ReviewHistoryRecord } from "@/domains/review/services/SpacedRepetitionService";
import { DomainError } from "@/domains/shared/errors";
import {
  FlashcardId,
  ReviewHistoryId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import { reviewHistory } from "@/infrastructure/database/schema/content.schema";
import type { ReviewModeType } from "@/infrastructure/database/schema/enums";

/**
 * Map Drizzle ReviewModeType to domain ReviewMode
 */
function mapReviewMode(
  drizzleMode: ReviewModeType,
): "flashcard" | "quiz" | "recall" {
  // Map: learn -> flashcard, review -> quiz, cram -> recall
  if (drizzleMode === "learn") return "flashcard";
  if (drizzleMode === "review") return "quiz";
  return "recall";
}

/**
 * Map domain ReviewMode to Drizzle ReviewModeType
 */
function mapToDrizzleReviewMode(
  domainMode: "flashcard" | "quiz" | "recall",
): ReviewModeType {
  // Map: flashcard -> learn, quiz -> review, recall -> cram
  if (domainMode === "flashcard") return "learn";
  if (domainMode === "quiz") return "review";
  return "cram";
}

/**
 * Database implementation of ReviewHistory repository
 */
export class DatabaseReviewHistoryRepository
  implements IReviewHistoryRepository
{
  constructor(private readonly db: DbClient) {}

  async findById(id: ReviewHistoryId): Promise<ReviewHistoryRecord | null> {
    const rows = await this.db
      .select()
      .from(reviewHistory)
      .where(eq(reviewHistory.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToRecord(row);
  }

  async findLastReview(
    userId: UserId,
    flashcardId: FlashcardId,
  ): Promise<ReviewHistoryRecord | null> {
    const rows = await this.db
      .select()
      .from(reviewHistory)
      .where(
        and(
          eq(reviewHistory.userId, userId as string),
          eq(reviewHistory.flashcardId, flashcardId as number),
        ),
      )
      .orderBy(desc(reviewHistory.reviewDate))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToRecord(row);
  }

  async findByUser(userId: UserId): Promise<ReviewHistoryRecord[]> {
    const rows = await this.db
      .select()
      .from(reviewHistory)
      .where(eq(reviewHistory.userId, userId as string))
      .orderBy(desc(reviewHistory.reviewDate));

    return rows.map((row) => this.mapToRecord(row));
  }

  async findByFlashcard(
    flashcardId: FlashcardId,
  ): Promise<ReviewHistoryRecord[]> {
    const rows = await this.db
      .select()
      .from(reviewHistory)
      .where(eq(reviewHistory.flashcardId, flashcardId as number))
      .orderBy(desc(reviewHistory.reviewDate));

    return rows.map((row) => this.mapToRecord(row));
  }

  async findByUserAndFlashcard(
    userId: UserId,
    flashcardId: FlashcardId,
  ): Promise<ReviewHistoryRecord[]> {
    const rows = await this.db
      .select()
      .from(reviewHistory)
      .where(
        and(
          eq(reviewHistory.userId, userId as string),
          eq(reviewHistory.flashcardId, flashcardId as number),
        ),
      )
      .orderBy(desc(reviewHistory.reviewDate));

    return rows.map((row) => this.mapToRecord(row));
  }

  async findDueFlashcards(
    userId: UserId,
    limit?: number,
  ): Promise<FlashcardId[]> {
    const dueCondition = and(
      eq(reviewHistory.userId, userId as string),
      lte(reviewHistory.nextReviewDate, new Date()),
    );

    const baseQuery = this.db
      .select({
        flashcardId: reviewHistory.flashcardId,
        minNextReviewDate: sql<Date>`MIN(${reviewHistory.nextReviewDate})`,
      })
      .from(reviewHistory)
      .where(dueCondition)
      .groupBy(reviewHistory.flashcardId)
      .orderBy(sql`MIN(${reviewHistory.nextReviewDate})`);

    const rows = limit ? await baseQuery.limit(limit) : await baseQuery;

    return rows.map((row) => FlashcardId(row.flashcardId));
  }

  async countDueFlashcards(userId: UserId): Promise<number> {
    const [row] = await this.db
      .select({
        count: sql<number>`COUNT(DISTINCT ${reviewHistory.flashcardId})`,
      })
      .from(reviewHistory)
      .where(
        and(
          eq(reviewHistory.userId, userId as string),
          lte(reviewHistory.nextReviewDate, new Date()),
        ),
      );

    return row?.count ?? 0;
  }

  async save(record: ReviewHistoryRecord): Promise<ReviewHistoryRecord> {
    const [inserted] = await this.db
      .insert(reviewHistory)
      .values({
        userId: record.userId as string,
        flashcardId: record.flashcardId as number,
        reviewMode: mapToDrizzleReviewMode(record.reviewMode),
        isCorrect: record.isCorrect,
        reviewDate: record.reviewDate,
        nextReviewDate: record.nextReviewDate,
        intervalDays: record.intervalDays,
      })
      .returning({ id: reviewHistory.id });

    return {
      ...record,
      id: ReviewHistoryId(inserted.id),
    };
  }

  async delete(id: ReviewHistoryId): Promise<void> {
    const result = await this.db
      .delete(reviewHistory)
      .where(eq(reviewHistory.id, id as number));

    if ((result.rowCount ?? 0) === 0) {
      throw new DomainError(
        "Review history not found",
        "REVIEW_HISTORY_NOT_FOUND",
      );
    }
  }

  async deleteByUser(userId: UserId): Promise<void> {
    await this.db
      .delete(reviewHistory)
      .where(eq(reviewHistory.userId, userId as string));
  }

  async deleteByFlashcard(flashcardId: FlashcardId): Promise<void> {
    await this.db
      .delete(reviewHistory)
      .where(eq(reviewHistory.flashcardId, flashcardId as number));
  }

  private mapToRecord(row: {
    id: number;
    userId: string;
    flashcardId: number;
    reviewMode: ReviewModeType;
    isCorrect: boolean;
    reviewDate: Date;
    nextReviewDate: Date;
    intervalDays: number;
  }): ReviewHistoryRecord {
    return {
      id: ReviewHistoryId(row.id),
      userId: UserId(row.userId),
      flashcardId: FlashcardId(row.flashcardId),
      reviewMode: mapReviewMode(row.reviewMode),
      isCorrect: row.isCorrect,
      reviewDate: row.reviewDate,
      nextReviewDate: row.nextReviewDate,
      intervalDays: row.intervalDays,
    };
  }
}
