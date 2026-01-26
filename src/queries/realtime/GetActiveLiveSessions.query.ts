import type { IQuery } from "@/commands/types";

export interface GetActiveLiveSessionsQuery extends IQuery {
  readonly type: "GetActiveLiveSessions";
  readonly groupId: number;
  readonly userId: string;
}

export const getActiveLiveSessionsQuery = (
  groupId: number,
  userId: string
): GetActiveLiveSessionsQuery => ({
  type: "GetActiveLiveSessions",
  groupId,
  userId,
});
