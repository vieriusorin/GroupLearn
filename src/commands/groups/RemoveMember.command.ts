import type { ICommand } from "../types";

export interface RemoveMemberCommand extends ICommand {
  readonly type: "RemoveMember";
  readonly userId: string;
  readonly groupId: number;
  readonly targetUserId: number;
}

export const removeMemberCommand = (
  userId: string,
  groupId: number,
  targetUserId: number,
): RemoveMemberCommand => ({
  type: "RemoveMember",
  userId,
  groupId,
  targetUserId,
});
