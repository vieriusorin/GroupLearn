import type { IQuery } from "@/commands/types";

export interface GetLiveSessionLeaderboardQuery extends IQuery {
  readonly type: "GetLiveSessionLeaderboard";
  readonly sessionId: number;
}

export const getLiveSessionLeaderboardQuery = (
  sessionId: number
): GetLiveSessionLeaderboardQuery => ({
  type: "GetLiveSessionLeaderboard",
  sessionId,
});
