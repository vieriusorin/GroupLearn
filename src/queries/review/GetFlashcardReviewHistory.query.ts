import type { IQuery } from "@/commands/types";

export interface GetFlashcardReviewHistoryQuery extends IQuery {
  readonly type: "GetFlashcardReviewHistory";
  readonly flashcardId: number;
}

export const getFlashcardReviewHistoryQuery = (
  flashcardId: number,
): GetFlashcardReviewHistoryQuery => ({
  type: "GetFlashcardReviewHistory",
  flashcardId,
});
