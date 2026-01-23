import type { ICommand } from "../types";

export interface SendInvitationCommand extends ICommand {
  readonly type: "SendInvitation";
  readonly userId: string;
  readonly groupId: number;
  readonly email: string;
  readonly role: "member" | "admin";
  readonly pathIds?: number[];
}

export const sendInvitationCommand = (
  userId: string,
  groupId: number,
  email: string,
  role: "member" | "admin",
  pathIds?: number[],
): SendInvitationCommand => ({
  type: "SendInvitation",
  userId,
  groupId,
  email,
  role,
  pathIds,
});
