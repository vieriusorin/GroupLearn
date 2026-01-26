import type { ICommand } from "../types";

export interface StartLiveSessionCommand extends ICommand {
  readonly type: "StartLiveSession";
  readonly userId: string;
  readonly sessionId: number;
  readonly flashcardIds?: number[]; // Optional: manually selected flashcards
}

export const startLiveSessionCommand = (
  userId: string,
  sessionId: number,
  flashcardIds?: number[]
): StartLiveSessionCommand => ({
  type: "StartLiveSession",
  userId,
  sessionId,
  flashcardIds,
});
