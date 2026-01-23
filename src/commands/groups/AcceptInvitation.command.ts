import type { ICommand } from "../types";

export interface AcceptInvitationCommand extends ICommand {
  readonly type: "AcceptInvitation";
  readonly userId: string;
  readonly token: string;
}

export const acceptInvitationCommand = (
  userId: string,
  token: string,
): AcceptInvitationCommand => ({
  type: "AcceptInvitation",
  userId,
  token,
});
