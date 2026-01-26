import type { IQuery } from "@/commands/types";

export interface GetLiveSessionDetailQuery extends IQuery {
  readonly type: "GetLiveSessionDetail";
  readonly sessionId: number;
  readonly userId: string;
}

export const getLiveSessionDetailQuery = (
  sessionId: number,
  userId: string
): GetLiveSessionDetailQuery => ({
  type: "GetLiveSessionDetail",
  sessionId,
  userId,
});
