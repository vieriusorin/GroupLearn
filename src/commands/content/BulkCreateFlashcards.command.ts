import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import type { ICommand } from "../types";

export interface BulkCreateFlashcardsCommand extends ICommand {
  readonly type: "BulkCreateFlashcards";
  readonly userId: string;
  readonly categoryId: number;
  readonly flashcards: Array<{
    question: string;
    answer: string;
    difficulty?: DifficultyLevelType;
  }>;
}

export const bulkCreateFlashcardsCommand = (
  userId: string,
  categoryId: number,
  flashcards: Array<{
    question: string;
    answer: string;
    difficulty?: DifficultyLevelType;
  }>,
): BulkCreateFlashcardsCommand => ({
  type: "BulkCreateFlashcards",
  userId,
  categoryId,
  flashcards,
});
