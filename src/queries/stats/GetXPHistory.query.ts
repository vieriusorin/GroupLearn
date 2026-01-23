import type { IQuery } from "@/commands/types";

export interface GetXPHistoryQuery extends IQuery {
  readonly type: "GetXPHistory";
  readonly pathId: number;
  readonly limit?: number;
}

export const getXPHistoryQuery = (
  pathId: number,
  limit?: number,
): GetXPHistoryQuery => ({
  type: "GetXPHistory",
  pathId,
  limit,
});
