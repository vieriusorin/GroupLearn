import type { ICommand } from "../types";

export interface RemoveFromStrugglingQueueCommand extends ICommand {
  readonly type: "RemoveFromStrugglingQueue";
  readonly flashcardId: number;
}

export const removeFromStrugglingQueueCommand = (
  flashcardId: number,
): RemoveFromStrugglingQueueCommand => ({
  type: "RemoveFromStrugglingQueue",
  flashcardId,
});
