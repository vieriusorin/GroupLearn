import type { IQuery } from "@/commands/types";

export interface IsPathCompletedQuery extends IQuery {
  readonly type: "IsPathCompleted";
  readonly pathId: number;
  readonly userId: string;
}

export const isPathCompletedQuery = (
  pathId: number,
  userId: string,
): IsPathCompletedQuery => ({
  type: "IsPathCompleted",
  pathId,
  userId,
});
