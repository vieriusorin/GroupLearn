import type { IQuery } from "@/commands/types";

export interface GetLessonByIdQuery extends IQuery {
  readonly type: "GetLessonById";
  readonly lessonId: number;
}

export const getLessonByIdQuery = (lessonId: number): GetLessonByIdQuery => ({
  type: "GetLessonById",
  lessonId,
});
