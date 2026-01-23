import type { IQuery } from "@/commands/types";

export interface GetStatsQuery extends IQuery {
  readonly type: "GetStats";
  readonly userId: string;
}

export const getStatsQuery = (userId: string): GetStatsQuery => ({
  type: "GetStats",
  userId,
});
