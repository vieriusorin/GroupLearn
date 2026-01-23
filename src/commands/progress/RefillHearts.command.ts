import type { ICommand } from "../types";

export interface RefillHeartsCommand extends ICommand {
  readonly type: "RefillHearts";
  readonly userId: string;
  readonly pathId: number;
}

export const refillHeartsCommand = (
  userId: string,
  pathId: number,
): RefillHeartsCommand => ({
  type: "RefillHearts",
  userId,
  pathId,
});
