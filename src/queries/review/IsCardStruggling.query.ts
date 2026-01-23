import type { IQuery } from "@/commands/types";

export interface IsCardStrugglingQuery extends IQuery {
  readonly type: "IsCardStruggling";
  readonly flashcardId: number;
}

export const isCardStrugglingQuery = (
  flashcardId: number,
): IsCardStrugglingQuery => ({
  type: "IsCardStruggling",
  flashcardId,
});
