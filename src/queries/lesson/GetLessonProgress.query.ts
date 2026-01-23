import type { IQuery } from "@/commands/types";

export interface GetLessonProgressQuery extends IQuery {
  readonly type: "GetLessonProgress";
  readonly userId: string;
  readonly lessonId: number;
  readonly pathId: number;
}

export const getLessonProgressQuery = (
  userId: string,
  lessonId: number,
  pathId: number,
): GetLessonProgressQuery => ({
  type: "GetLessonProgress",
  userId,
  lessonId,
  pathId,
});
