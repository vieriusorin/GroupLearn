import type { ICommand } from "../types";

export interface CreateGroupCommand extends ICommand {
  readonly type: "CreateGroup";
  readonly userId: string;
  readonly name: string;
  readonly description?: string | null;
}

export const createGroupCommand = (
  userId: string,
  name: string,
  description?: string | null,
): CreateGroupCommand => ({
  type: "CreateGroup",
  userId,
  name,
  description,
});
