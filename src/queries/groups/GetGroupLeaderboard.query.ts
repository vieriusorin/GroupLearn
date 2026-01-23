import type { IQuery } from "@/commands/types";

export interface GetGroupLeaderboardQuery extends IQuery {
  readonly type: "GetGroupLeaderboard";
  readonly groupId: number;
  readonly limit?: number;
}

export const getGroupLeaderboardQuery = (
  groupId: number,
  limit?: number,
): GetGroupLeaderboardQuery => ({
  type: "GetGroupLeaderboard",
  groupId,
  limit,
});
