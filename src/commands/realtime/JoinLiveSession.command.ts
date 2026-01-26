import type { ICommand } from "../types";

export interface JoinLiveSessionCommand extends ICommand {
  readonly type: "JoinLiveSession";
  readonly userId: string;
  readonly sessionId: number;
}

export const joinLiveSessionCommand = (
  userId: string,
  sessionId: number
): JoinLiveSessionCommand => ({
  type: "JoinLiveSession",
  userId,
  sessionId,
});
