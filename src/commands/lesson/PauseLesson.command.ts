import type { ICommand } from "../types";

export interface PauseLessonCommand extends ICommand {
  readonly type: "PauseLesson";
  readonly userId: string;
  readonly lessonId: number;
}

export const pauseLessonCommand = (
  userId: string,
  lessonId: number,
): PauseLessonCommand => ({
  type: "PauseLesson",
  userId,
  lessonId,
});
