import type { IQuery } from "@/commands/types";

export interface GetUnitsQuery extends IQuery {
  readonly type: "GetUnits";
  readonly userId: string;
  readonly pathId: number;
}

export const getUnitsQuery = (
  userId: string,
  pathId: number,
): GetUnitsQuery => ({
  type: "GetUnits",
  userId,
  pathId,
});
