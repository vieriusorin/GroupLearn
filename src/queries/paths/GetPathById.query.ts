import type { IQuery } from "@/commands/types";

export interface GetPathByIdQuery extends IQuery {
  readonly type: "GetPathById";
  readonly pathId: number;
}

export const getPathByIdQuery = (pathId: number): GetPathByIdQuery => ({
  type: "GetPathById",
  pathId,
});
