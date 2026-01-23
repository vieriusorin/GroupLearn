import type { IQuery } from "@/commands/types";

export interface GetAssignedPathsQuery extends IQuery {
  readonly type: "GetAssignedPaths";
  readonly userId: string;
  readonly groupId: number;
}

export const getAssignedPathsQuery = (
  userId: string,
  groupId: number,
): GetAssignedPathsQuery => ({
  type: "GetAssignedPaths",
  userId,
  groupId,
});
