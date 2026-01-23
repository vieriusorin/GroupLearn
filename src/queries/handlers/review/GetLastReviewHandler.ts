import { desc, eq } from "drizzle-orm";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import type { ReviewHistory } from "@/infrastructure/database/schema";
import { reviewHistory as reviewHistoryTable } from "@/infrastructure/database/schema";
import type { GetLastReviewQuery } from "@/queries/review/GetLastReview.query";

export class GetLastReviewHandler
  implements IQueryHandler<GetLastReviewQuery, ReviewHistory | undefined>
{
  async execute(query: GetLastReviewQuery): Promise<ReviewHistory | undefined> {
    const [row] = await db
      .select()
      .from(reviewHistoryTable)
      .where(eq(reviewHistoryTable.flashcardId, query.flashcardId))
      .orderBy(desc(reviewHistoryTable.reviewDate))
      .limit(1);

    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      userId: row.userId,
      flashcardId: row.flashcardId,
      reviewMode: row.reviewMode,
      isCorrect: row.isCorrect,
      reviewDate: row.reviewDate,
      nextReviewDate: row.nextReviewDate,
      intervalDays: row.intervalDays,
    } as ReviewHistory;
  }
}
