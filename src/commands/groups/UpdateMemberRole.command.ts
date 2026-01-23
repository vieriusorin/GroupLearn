import type { ICommand } from "../types";

export interface UpdateMemberRoleCommand extends ICommand {
  readonly type: "UpdateMemberRole";
  readonly userId: string;
  readonly groupId: number;
  readonly targetUserId: number;
  readonly role: "member" | "admin";
}

export const updateMemberRoleCommand = (
  userId: string,
  groupId: number,
  targetUserId: number,
  role: "member" | "admin",
): UpdateMemberRoleCommand => ({
  type: "UpdateMemberRole",
  userId,
  groupId,
  targetUserId,
  role,
});
