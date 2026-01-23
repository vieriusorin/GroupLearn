import type { IQuery } from "@/commands/types";

export interface GetFlashcardByIdQuery extends IQuery {
  readonly type: "GetFlashcardById";
  readonly id: number;
}

export const getFlashcardByIdQuery = (id: number): GetFlashcardByIdQuery => ({
  type: "GetFlashcardById",
  id,
});
