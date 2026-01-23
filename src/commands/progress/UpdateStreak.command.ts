import type { ICommand } from "../types";

export interface UpdateStreakCommand extends ICommand {
  readonly type: "UpdateStreak";
  readonly userId: string;
  readonly pathId: number;
}

export const updateStreakCommand = (
  userId: string,
  pathId: number,
): UpdateStreakCommand => ({
  type: "UpdateStreak",
  userId,
  pathId,
});
