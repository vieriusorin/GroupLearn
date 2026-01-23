import type { ReviewMode } from "@/domains/review/aggregates/ReviewSession";
import type { ICommand } from "../types";

export interface StartReviewSessionCommand extends ICommand {
  readonly type: "StartReviewSession";
  readonly userId: string;
  readonly mode?: ReviewMode;
  readonly limit?: number;
}

export const startReviewSessionCommand = (
  userId: string,
  mode?: ReviewMode,
  limit?: number,
): StartReviewSessionCommand => ({
  type: "StartReviewSession",
  userId,
  mode,
  limit,
});
