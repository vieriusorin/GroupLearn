import type { ICommand } from "../types";

export interface DeleteGroupCommand extends ICommand {
  readonly type: "DeleteGroup";
  readonly userId: string;
  readonly groupId: number;
}

export const deleteGroupCommand = (
  userId: string,
  groupId: number,
): DeleteGroupCommand => ({
  type: "DeleteGroup",
  userId,
  groupId,
});
