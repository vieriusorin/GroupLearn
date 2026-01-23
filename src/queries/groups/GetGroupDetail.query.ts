import type { IQuery } from "@/commands/types";

export interface GetGroupDetailQuery extends IQuery {
  readonly type: "GetGroupDetail";
  readonly userId: string;
  readonly groupId: number;
}

export const getGroupDetailQuery = (
  userId: string,
  groupId: number,
): GetGroupDetailQuery => ({
  type: "GetGroupDetail",
  userId,
  groupId,
});
