import type { ICommand } from "../types";

export interface CompleteLessonCommand extends ICommand {
  readonly type: "CompleteLesson";
  readonly userId: string;
  readonly lessonId: number;
  readonly pathId: number;
  readonly accuracy: number;
  readonly heartsRemaining: number;
  readonly cardsReviewed: number;
  readonly isPerfect: boolean;
  readonly timeSpentSeconds: number;
}

export const completeLessonCommand = (
  userId: string,
  lessonId: number,
  pathId: number,
  accuracy: number,
  heartsRemaining: number,
  cardsReviewed: number,
  isPerfect: boolean,
  timeSpentSeconds: number,
): CompleteLessonCommand => ({
  type: "CompleteLesson",
  userId,
  lessonId,
  pathId,
  accuracy,
  heartsRemaining,
  cardsReviewed,
  isPerfect,
  timeSpentSeconds,
});
