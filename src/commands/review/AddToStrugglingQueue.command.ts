import type { ICommand } from "../types";

export interface AddToStrugglingQueueCommand extends ICommand {
  readonly type: "AddToStrugglingQueue";
  readonly flashcardId: number;
}

export const addToStrugglingQueueCommand = (
  flashcardId: number,
): AddToStrugglingQueueCommand => ({
  type: "AddToStrugglingQueue",
  flashcardId,
});
