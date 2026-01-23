import type { IQuery } from "@/commands/types";

export interface GetFlashcardsQuery extends IQuery {
  readonly type: "GetFlashcards";
  readonly categoryId?: number;
  readonly page?: number;
  readonly limit?: number;
}

export const getFlashcardsQuery = (
  categoryId?: number,
  page: number = 1,
  limit: number = 20,
): GetFlashcardsQuery => ({
  type: "GetFlashcards",
  categoryId,
  page,
  limit,
});
