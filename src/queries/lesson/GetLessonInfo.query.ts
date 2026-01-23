import type { IQuery } from "@/commands/types";

export interface GetLessonInfoQuery extends IQuery {
  readonly type: "GetLessonInfo";
  readonly lessonId: number;
}

export const getLessonInfoQuery = (lessonId: number): GetLessonInfoQuery => ({
  type: "GetLessonInfo",
  lessonId,
});
