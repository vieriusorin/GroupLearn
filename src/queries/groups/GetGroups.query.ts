import type { IQuery } from "@/commands/types";

export interface GetGroupsQuery extends IQuery {
  readonly type: "GetGroups";
  readonly userId: string;
}

export const getGroupsQuery = (userId: string): GetGroupsQuery => ({
  type: "GetGroups",
  userId,
});
