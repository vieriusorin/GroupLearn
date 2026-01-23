import type { IQuery } from "@/commands/types";

export interface GetGroupAnalyticsQuery extends IQuery {
  readonly type: "GetGroupAnalytics";
  readonly groupId: number;
}

export const getGroupAnalyticsQuery = (
  groupId: number,
): GetGroupAnalyticsQuery => ({
  type: "GetGroupAnalytics",
  groupId,
});
