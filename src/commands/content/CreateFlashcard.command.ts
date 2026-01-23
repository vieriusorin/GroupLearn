import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import type { ICommand } from "../types";

export interface CreateFlashcardCommand extends ICommand {
  readonly type: "CreateFlashcard";
  readonly userId: string;
  readonly categoryId: number;
  readonly question: string;
  readonly answer: string;
  readonly difficulty?: DifficultyLevelType;
}

export const createFlashcardCommand = (
  userId: string,
  categoryId: number,
  question: string,
  answer: string,
  difficulty?: DifficultyLevelType,
): CreateFlashcardCommand => ({
  type: "CreateFlashcard",
  userId,
  categoryId,
  question,
  answer,
  difficulty,
});
