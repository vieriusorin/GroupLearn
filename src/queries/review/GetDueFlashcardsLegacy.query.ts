import type { IQuery } from "@/commands/types";

export interface GetDueFlashcardsLegacyQuery extends IQuery {
  readonly type: "GetDueFlashcardsLegacy";
  readonly limit?: number;
}

export const getDueFlashcardsLegacyQuery = (
  limit?: number,
): GetDueFlashcardsLegacyQuery => ({
  type: "GetDueFlashcardsLegacy",
  limit,
});
