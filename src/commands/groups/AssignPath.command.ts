import type { ICommand } from "../types";

export interface AssignPathCommand extends ICommand {
  readonly type: "AssignPath";
  readonly userId: string;
  readonly groupId: number;
  readonly pathId: number;
  readonly isVisible?: boolean;
}

export const assignPathCommand = (
  userId: string,
  groupId: number,
  pathId: number,
  isVisible?: boolean,
): AssignPathCommand => ({
  type: "AssignPath",
  userId,
  groupId,
  pathId,
  isVisible,
});
