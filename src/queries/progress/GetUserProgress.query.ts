import type { IQuery } from "@/commands/types";

export interface GetUserProgressQuery extends IQuery {
  readonly type: "GetUserProgress";
  readonly userId: string;
  readonly pathId: number;
}

export const getUserProgressQuery = (
  userId: string,
  pathId: number,
): GetUserProgressQuery => ({
  type: "GetUserProgress",
  userId,
  pathId,
});
