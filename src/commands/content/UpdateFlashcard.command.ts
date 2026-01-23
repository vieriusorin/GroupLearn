import type { DifficultyLevelType } from "@/infrastructure/database/schema/enums";
import type { ICommand } from "../types";

export interface UpdateFlashcardCommand extends ICommand {
  readonly type: "UpdateFlashcard";
  readonly userId: string;
  readonly flashcardId: number;
  readonly question?: string;
  readonly answer?: string;
  readonly difficulty?: DifficultyLevelType;
}

export const updateFlashcardCommand = (
  userId: string,
  flashcardId: number,
  question?: string,
  answer?: string,
  difficulty?: DifficultyLevelType,
): UpdateFlashcardCommand => ({
  type: "UpdateFlashcard",
  userId,
  flashcardId,
  question,
  answer,
  difficulty,
});
