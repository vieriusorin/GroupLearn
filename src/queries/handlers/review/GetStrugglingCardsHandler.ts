import { count, desc, eq } from "drizzle-orm";
import type {
  GetStrugglingCardsResult,
  StrugglingCard,
} from "@/application/dtos/review.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import {
  type DifficultyLevelType,
  flashcards,
  strugglingQueue,
} from "@/infrastructure/database/schema";
import type { GetStrugglingCardsQuery } from "@/queries/review/GetStrugglingCards.query";

export class GetStrugglingCardsHandler
  implements IQueryHandler<GetStrugglingCardsQuery, GetStrugglingCardsResult>
{
  async execute(
    query: GetStrugglingCardsQuery,
  ): Promise<GetStrugglingCardsResult> {
    let queryBuilder = db
      .select({
        id: strugglingQueue.id,
        flashcardId: strugglingQueue.flashcardId,
        timesFailed: strugglingQueue.timesFailed,
        lastFailedAt: strugglingQueue.lastFailedAt,
        addedAt: strugglingQueue.addedAt,
        question: flashcards.question,
        answer: flashcards.answer,
        difficulty: flashcards.difficulty,
      })
      .from(strugglingQueue)
      .innerJoin(flashcards, eq(strugglingQueue.flashcardId, flashcards.id))
      .orderBy(
        desc(strugglingQueue.timesFailed),
        desc(strugglingQueue.lastFailedAt),
      );

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit) as any;
    }

    const rows = await queryBuilder;

    const [totalRow] = await db
      .select({ count: count() })
      .from(strugglingQueue);
    const total = Number(totalRow.count) || 0;

    const cards: StrugglingCard[] = rows.map((row) => ({
      id: row.flashcardId,
      question: row.question,
      answer: row.answer,
      difficulty: row.difficulty as DifficultyLevelType,
      timesFailed: row.timesFailed || 0,
      lastFailedAt: row.lastFailedAt?.toISOString() || "",
      addedAt: row.addedAt?.toISOString() || "",
    }));

    return {
      cards,
      total,
    };
  }
}
