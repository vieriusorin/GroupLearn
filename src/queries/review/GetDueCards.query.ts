import type { IQuery } from "@/commands/types";

export interface GetDueCardsQuery extends IQuery {
  readonly type: "GetDueCards";
  readonly userId: string;
  readonly limit?: number;
}

export const getDueCardsQuery = (
  userId: string,
  limit?: number,
): GetDueCardsQuery => ({
  type: "GetDueCards",
  userId,
  limit,
});
