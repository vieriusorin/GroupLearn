import type { IQuery } from "@/commands/types";

export interface GetUserPathsQuery extends IQuery {
  readonly type: "GetUserPaths";
  readonly userId: string;
}

export const getUserPathsQuery = (userId: string): GetUserPathsQuery => ({
  type: "GetUserPaths",
  userId,
});
