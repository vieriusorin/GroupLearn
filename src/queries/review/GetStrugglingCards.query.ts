import type { IQuery } from "@/commands/types";

export interface GetStrugglingCardsQuery extends IQuery {
  readonly type: "GetStrugglingCards";
  readonly userId: string;
  readonly limit?: number;
}

export const getStrugglingCardsQuery = (
  userId: string,
  limit?: number,
): GetStrugglingCardsQuery => ({
  type: "GetStrugglingCards",
  userId,
  limit,
});
