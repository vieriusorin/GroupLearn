import { asc, sql } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { Flashcard } from "@/infrastructure/database/schema";
import {
  flashcards as flashcardsTable,
  reviewHistory as reviewHistoryTable,
} from "@/infrastructure/database/schema";
import type { GetDueFlashcardsLegacyQuery } from "@/queries/review/GetDueFlashcardsLegacy.query";

export class GetDueFlashcardsLegacyHandler
  implements IQueryHandler<GetDueFlashcardsLegacyQuery, Flashcard[]>
{
  async execute(query: GetDueFlashcardsLegacyQuery): Promise<Flashcard[]> {
    // This is a legacy, user-agnostic implementation used only for aggregated stats.
    // It finds the latest review record (by date) for each flashcard and checks if its
    // nextReviewDate is in the past or today. Flashcards without any reviews are treated as due.

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get only the latest review record per flashcard using a NOT EXISTS correlated subquery
    const latestWithDetails = await db
      .select({
        flashcardId: reviewHistoryTable.flashcardId,
        nextReviewDate: reviewHistoryTable.nextReviewDate,
      })
      .from(reviewHistoryTable)
      .where(
        sql`NOT EXISTS (
          SELECT 1
          FROM "review_history" rh2
          WHERE rh2."flashcard_id" = "review_history"."flashcard_id"
            AND rh2."review_date" > "review_history"."review_date"
        )`,
      );

    const dueIds = new Set<number>();
    for (const row of latestWithDetails) {
      const next = new Date(row.nextReviewDate);
      next.setHours(0, 0, 0, 0);
      if (next <= today) {
        dueIds.add(row.flashcardId);
      }
    }

    // Track which flashcards have any review history
    const cardsWithHistoryRows = await db
      .select({
        flashcardId: reviewHistoryTable.flashcardId,
      })
      .from(reviewHistoryTable)
      .groupBy(reviewHistoryTable.flashcardId);

    const cardsWithHistory = new Set<number>(
      cardsWithHistoryRows.map((row) => row.flashcardId),
    );

    // Include flashcards with no history as due
    const allCards = await db
      .select()
      .from(flashcardsTable)
      .orderBy(asc(flashcardsTable.createdAt));
    const dueCards = allCards.filter(
      (card) => dueIds.has(card.id) || !cardsWithHistory.has(card.id),
    );

    const sliced =
      typeof query.limit === "number"
        ? dueCards.slice(0, query.limit)
        : dueCards;
    return sliced as Flashcard[];
  }
}
