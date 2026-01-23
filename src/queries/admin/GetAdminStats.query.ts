import type { IQuery } from "@/commands/types";

export interface GetAdminStatsQuery extends IQuery {
  readonly type: "GetAdminStats";
}

export const getAdminStatsQuery = (): GetAdminStatsQuery => ({
  type: "GetAdminStats",
});
