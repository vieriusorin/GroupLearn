import type { IQuery } from "@/commands/types";

export interface IsLessonUnlockedQuery extends IQuery {
  readonly type: "IsLessonUnlocked";
  readonly lessonId: number;
  readonly userId: string;
}

export const isLessonUnlockedQuery = (
  lessonId: number,
  userId: string,
): IsLessonUnlockedQuery => ({
  type: "IsLessonUnlocked",
  lessonId,
  userId,
});
