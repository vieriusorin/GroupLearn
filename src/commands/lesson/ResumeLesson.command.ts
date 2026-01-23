import type { ICommand } from "../types";

export interface ResumeLessonCommand extends ICommand {
  readonly type: "ResumeLesson";
  readonly userId: string;
  readonly sessionId: string;
}

export const resumeLessonCommand = (
  userId: string,
  sessionId: string,
): ResumeLessonCommand => ({
  type: "ResumeLesson",
  userId,
  sessionId,
});
