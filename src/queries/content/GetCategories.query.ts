import type { IQuery } from "@/commands/types";

export interface GetCategoriesQuery extends IQuery {
  readonly type: "GetCategories";
  readonly domainId: number;
}

export const getCategoriesQuery = (domainId: number): GetCategoriesQuery => ({
  type: "GetCategories",
  domainId,
});
