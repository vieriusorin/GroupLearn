import type { IQuery } from "@/commands/types";

export interface GetLessonsQuery extends IQuery {
  readonly type: "GetLessons";
  readonly userId: string;
  readonly unitId: number;
}

export const getLessonsQuery = (
  userId: string,
  unitId: number,
): GetLessonsQuery => ({
  type: "GetLessons",
  userId,
  unitId,
});
