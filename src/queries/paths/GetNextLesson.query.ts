import type { IQuery } from "@/commands/types";

export interface GetNextLessonQuery extends IQuery {
  readonly type: "GetNextLesson";
  readonly pathId: number;
  readonly userId: string;
}

export const getNextLessonQuery = (
  pathId: number,
  userId: string,
): GetNextLessonQuery => ({
  type: "GetNextLesson",
  pathId,
  userId,
});
