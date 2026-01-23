import type { ICommand } from "../types";

export interface DeleteFlashcardCommand extends ICommand {
  readonly type: "DeleteFlashcard";
  readonly userId: string;
  readonly flashcardId: number;
}

export const deleteFlashcardCommand = (
  userId: string,
  flashcardId: number,
): DeleteFlashcardCommand => ({
  type: "DeleteFlashcard",
  userId,
  flashcardId,
});
