import type { ICommand } from "../types";

export interface EndLiveSessionCommand extends ICommand {
  readonly type: "EndLiveSession";
  readonly userId: string;
  readonly sessionId: number;
}

export const endLiveSessionCommand = (
  userId: string,
  sessionId: number
): EndLiveSessionCommand => ({
  type: "EndLiveSession",
  userId,
  sessionId,
});
