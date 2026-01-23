import type { IQuery } from "@/commands/types";

export interface GetNextLessonAfterCompletionQuery extends IQuery {
  readonly type: "GetNextLessonAfterCompletion";
  readonly completedLessonId: number;
}

export const getNextLessonAfterCompletionQuery = (
  completedLessonId: number,
): GetNextLessonAfterCompletionQuery => ({
  type: "GetNextLessonAfterCompletion",
  completedLessonId,
});
