import type { IQuery } from "@/commands/types";

export interface GetUnitByIdQuery extends IQuery {
  readonly type: "GetUnitById";
  readonly unitId: number;
}

export const getUnitByIdQuery = (unitId: number): GetUnitByIdQuery => ({
  type: "GetUnitById",
  unitId,
});
