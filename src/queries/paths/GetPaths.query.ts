import type { IQuery } from "@/commands/types";

export interface GetPathsQuery extends IQuery {
  readonly type: "GetPaths";
  readonly userId: string;
  readonly domainId?: number;
}

export const getPathsQuery = (
  userId: string,
  domainId?: number,
): GetPathsQuery => ({
  type: "GetPaths",
  userId,
  domainId,
});
