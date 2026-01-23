import type { IQuery } from "@/commands/types";

export interface GetCurrentStreakQuery extends IQuery {
  readonly type: "GetCurrentStreak";
}

export const getCurrentStreakQuery = (): GetCurrentStreakQuery => ({
  type: "GetCurrentStreak",
});
