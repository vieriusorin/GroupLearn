import type { ICommand } from "../types";

export interface SubmitReviewCommand extends ICommand {
  readonly type: "SubmitReview";
  readonly userId: string;
  readonly sessionId: string;
  readonly flashcardId: number;
  readonly isCorrect: boolean;
}

export const submitReviewCommand = (
  userId: string,
  sessionId: string,
  flashcardId: number,
  isCorrect: boolean,
): SubmitReviewCommand => ({
  type: "SubmitReview",
  userId,
  sessionId,
  flashcardId,
  isCorrect,
});
