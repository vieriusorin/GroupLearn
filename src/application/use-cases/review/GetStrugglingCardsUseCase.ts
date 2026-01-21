import { desc, eq, sql } from "drizzle-orm";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { db } from "@/infrastructure/database/drizzle";
import {
  type DifficultyLevelType,
  flashcards,
  strugglingQueue,
} from "@/infrastructure/database/schema";

export interface GetStrugglingCardsRequest {
  userId: string;
  limit?: number;
}

export interface GetStrugglingCardsResponse {
  cards: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: DifficultyLevelType;
    timesFailed: number;
    lastFailedAt: string;
    addedAt: string;
  }>;
  total: number;
}

export class GetStrugglingCardsUseCase {
  constructor(readonly _flashcardRepository: IFlashcardRepository) {}

  async execute(
    request: GetStrugglingCardsRequest,
  ): Promise<GetStrugglingCardsResponse> {
    let query = db
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

    if (request.limit) {
      query = query.limit(request.limit) as any;
    }

    const rows = await query;

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(strugglingQueue);
    const total = Number(totalRow.count) || 0;

    const cards = rows.map((row) => ({
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
