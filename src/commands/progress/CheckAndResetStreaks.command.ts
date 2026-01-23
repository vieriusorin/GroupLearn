import type { ICommand } from "../types";

export interface CheckAndResetStreaksCommand extends ICommand {
  readonly type: "CheckAndResetStreaks";
  readonly userId: string;
}

export const checkAndResetStreaksCommand = (
  userId: string,
): CheckAndResetStreaksCommand => ({
  type: "CheckAndResetStreaks",
  userId,
});
