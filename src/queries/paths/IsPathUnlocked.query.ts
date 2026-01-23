import type { IQuery } from "@/commands/types";

export interface IsPathUnlockedQuery extends IQuery {
  readonly type: "IsPathUnlocked";
  readonly pathId: number;
  readonly userId: string;
}

export const isPathUnlockedQuery = (
  pathId: number,
  userId: string,
): IsPathUnlockedQuery => ({
  type: "IsPathUnlocked",
  pathId,
  userId,
});
