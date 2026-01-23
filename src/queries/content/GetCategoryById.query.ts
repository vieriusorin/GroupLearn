import type { IQuery } from "@/commands/types";

export interface GetCategoryByIdQuery extends IQuery {
  readonly type: "GetCategoryById";
  readonly id: number;
}

export const getCategoryByIdQuery = (id: number): GetCategoryByIdQuery => ({
  type: "GetCategoryById",
  id,
});
