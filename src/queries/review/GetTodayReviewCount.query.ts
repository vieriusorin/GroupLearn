import type { IQuery } from "@/commands/types";

export interface GetTodayReviewCountQuery extends IQuery {
  readonly type: "GetTodayReviewCount";
}

export const getTodayReviewCountQuery = (): GetTodayReviewCountQuery => ({
  type: "GetTodayReviewCount",
});
