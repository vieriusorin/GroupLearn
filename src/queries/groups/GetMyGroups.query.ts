import type { IQuery } from "@/commands/types";

export interface GetMyGroupsQuery extends IQuery {
  readonly type: "GetMyGroups";
  readonly userId: string;
}

export const getMyGroupsQuery = (userId: string): GetMyGroupsQuery => ({
  type: "GetMyGroups",
  userId,
});
