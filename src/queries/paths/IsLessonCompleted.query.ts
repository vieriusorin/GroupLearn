import type { IQuery } from "@/commands/types";

export interface IsLessonCompletedQuery extends IQuery {
  readonly type: "IsLessonCompleted";
  readonly lessonId: number;
  readonly userId: string;
}

export const isLessonCompletedQuery = (
  lessonId: number,
  userId: string,
): IsLessonCompletedQuery => ({
  type: "IsLessonCompleted",
  lessonId,
  userId,
});
