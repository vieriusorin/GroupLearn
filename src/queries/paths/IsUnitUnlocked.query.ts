import type { IQuery } from "@/commands/types";

export interface IsUnitUnlockedQuery extends IQuery {
  readonly type: "IsUnitUnlocked";
  readonly unitId: number;
  readonly userId: string;
}

export const isUnitUnlockedQuery = (
  unitId: number,
  userId: string,
): IsUnitUnlockedQuery => ({
  type: "IsUnitUnlocked",
  unitId,
  userId,
});
