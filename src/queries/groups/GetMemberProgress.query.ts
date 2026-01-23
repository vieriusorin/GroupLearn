import type { IQuery } from "@/commands/types";

export interface GetMemberProgressQuery extends IQuery {
  readonly type: "GetMemberProgress";
  readonly userId: string;
  readonly groupId: number;
  readonly targetUserId: string;
}

export const getMemberProgressQuery = (
  userId: string,
  groupId: number,
  targetUserId: string,
): GetMemberProgressQuery => ({
  type: "GetMemberProgress",
  userId,
  groupId,
  targetUserId,
});
