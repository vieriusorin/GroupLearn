import type { ICommand } from "../types";

export interface SubmitLiveAnswerCommand extends ICommand {
  readonly type: "SubmitLiveAnswer";
  readonly userId: string;
  readonly sessionId: number;
  readonly flashcardId: number;
  readonly answer: string;
  readonly responseTimeMs: number;
}

export const submitLiveAnswerCommand = (
  userId: string,
  sessionId: number,
  flashcardId: number,
  answer: string,
  responseTimeMs: number
): SubmitLiveAnswerCommand => ({
  type: "SubmitLiveAnswer",
  userId,
  sessionId,
  flashcardId,
  answer,
  responseTimeMs,
});
