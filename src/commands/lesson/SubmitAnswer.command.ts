import type { ICommand } from "../types";

export interface SubmitAnswerCommand extends ICommand {
  readonly type: "SubmitAnswer";
  readonly userId: string;
  readonly lessonId: number;
  readonly flashcardId: number;
  readonly isCorrect: boolean;
  readonly timeSpentSeconds?: number;
}

export const submitAnswerCommand = (
  userId: string,
  lessonId: number,
  flashcardId: number,
  isCorrect: boolean,
  timeSpentSeconds?: number,
): SubmitAnswerCommand => ({
  type: "SubmitAnswer",
  userId,
  lessonId,
  flashcardId,
  isCorrect,
  timeSpentSeconds,
});
