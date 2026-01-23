import type { IQuery } from "@/commands/types";

export interface GetUserStatsQuery extends IQuery {
  readonly type: "GetUserStats";
  readonly userId: string;
}

export const getUserStatsQuery = (userId: string): GetUserStatsQuery => ({
  type: "GetUserStats",
  userId,
});
