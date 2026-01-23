import type { ICommand } from "../types";

export interface AbandonLessonCommand extends ICommand {
  readonly type: "AbandonLesson";
  readonly userId: string;
  readonly lessonId: number;
  readonly reason?: string;
}

export const abandonLessonCommand = (
  userId: string,
  lessonId: number,
  reason?: string,
): AbandonLessonCommand => ({
  type: "AbandonLesson",
  userId,
  lessonId,
  reason,
});
