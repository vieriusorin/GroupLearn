import { desc, eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { ReviewHistory } from "@/infrastructure/database/schema";
import { reviewHistory as reviewHistoryTable } from "@/infrastructure/database/schema";
import type { GetFlashcardReviewHistoryQuery } from "@/queries/review/GetFlashcardReviewHistory.query";

export class GetFlashcardReviewHistoryHandler
  implements IQueryHandler<GetFlashcardReviewHistoryQuery, ReviewHistory[]>
{
  async execute(
    query: GetFlashcardReviewHistoryQuery,
  ): Promise<ReviewHistory[]> {
    const rows = await db
      .select()
      .from(reviewHistoryTable)
      .where(eq(reviewHistoryTable.flashcardId, query.flashcardId))
      .orderBy(desc(reviewHistoryTable.reviewDate));

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      flashcardId: row.flashcardId,
      reviewMode: row.reviewMode,
      isCorrect: row.isCorrect,
      reviewDate: row.reviewDate,
      nextReviewDate: row.nextReviewDate,
      intervalDays: row.intervalDays,
    })) as ReviewHistory[];
  }
}
