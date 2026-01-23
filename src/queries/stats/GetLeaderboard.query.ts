import type { IQuery } from "@/commands/types";

export interface GetLeaderboardQuery extends IQuery {
  readonly type: "GetLeaderboard";
  readonly userId: string;
  readonly period?: "all-time" | "7days" | "30days";
  readonly limit?: number;
}

export const getLeaderboardQuery = (
  userId: string,
  period?: "all-time" | "7days" | "30days",
  limit?: number,
): GetLeaderboardQuery => ({
  type: "GetLeaderboard",
  userId,
  period,
  limit,
});
