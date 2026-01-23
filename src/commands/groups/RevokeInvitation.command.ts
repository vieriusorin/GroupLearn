import type { ICommand } from "../types";

export interface RevokeInvitationCommand extends ICommand {
  readonly type: "RevokeInvitation";
  readonly userId: string;
  readonly groupId: number;
  readonly invitationId: number;
}

export const revokeInvitationCommand = (
  userId: string,
  groupId: number,
  invitationId: number,
): RevokeInvitationCommand => ({
  type: "RevokeInvitation",
  userId,
  groupId,
  invitationId,
});
