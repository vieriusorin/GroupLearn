import type { ICommand } from "../types";

export interface TogglePathVisibilityCommand extends ICommand {
  readonly type: "TogglePathVisibility";
  readonly userId: string;
  readonly groupId: number;
  readonly pathId: number;
  readonly isVisible: boolean;
}

export const togglePathVisibilityCommand = (
  userId: string,
  groupId: number,
  pathId: number,
  isVisible: boolean,
): TogglePathVisibilityCommand => ({
  type: "TogglePathVisibility",
  userId,
  groupId,
  pathId,
  isVisible,
});
