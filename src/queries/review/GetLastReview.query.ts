import type { IQuery } from "@/commands/types";

export interface GetLastReviewQuery extends IQuery {
  readonly type: "GetLastReview";
  readonly flashcardId: number;
}

export const getLastReviewQuery = (
  flashcardId: number,
): GetLastReviewQuery => ({
  type: "GetLastReview",
  flashcardId,
});
