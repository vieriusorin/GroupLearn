import type { IQuery } from "@/commands/types";

export interface GetConsecutiveDaysStreakQuery extends IQuery {
  readonly type: "GetConsecutiveDaysStreak";
  readonly userId: string;
}

export const getConsecutiveDaysStreakQuery = (
  userId: string,
): GetConsecutiveDaysStreakQuery => ({
  type: "GetConsecutiveDaysStreak",
  userId,
});
