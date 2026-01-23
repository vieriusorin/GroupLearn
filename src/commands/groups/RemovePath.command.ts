import type { ICommand } from "../types";

export interface RemovePathCommand extends ICommand {
  readonly type: "RemovePath";
  readonly userId: string;
  readonly groupId: number;
  readonly pathId: number;
}

export const removePathCommand = (
  userId: string,
  groupId: number,
  pathId: number,
): RemovePathCommand => ({
  type: "RemovePath",
  userId,
  groupId,
  pathId,
});
