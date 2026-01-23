import type { IQuery } from "@/commands/types";

export interface IsUnitCompletedQuery extends IQuery {
  readonly type: "IsUnitCompleted";
  readonly unitId: number;
  readonly userId: string;
}

export const isUnitCompletedQuery = (
  unitId: number,
  userId: string,
): IsUnitCompletedQuery => ({
  type: "IsUnitCompleted",
  unitId,
  userId,
});
