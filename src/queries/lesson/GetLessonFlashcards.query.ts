import type { IQuery } from "@/commands/types";

export interface GetLessonFlashcardsQuery extends IQuery {
  readonly type: "GetLessonFlashcards";
  readonly lessonId: number;
}

export const getLessonFlashcardsQuery = (
  lessonId: number,
): GetLessonFlashcardsQuery => ({
  type: "GetLessonFlashcards",
  lessonId,
});
