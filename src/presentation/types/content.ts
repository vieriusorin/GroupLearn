import type { DifficultyLevelType } from "@/infrastructure/database/schema/enums";

export type AdminDomainDto = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy: string | null | undefined;
};

export type AdminCategoryDto = {
  id: number;
  domainId: number;
  name: string;
  description: string | null;
  isDeprecated: boolean;
  createdAt: string;
};

export type AdminFlashcardDto = {
  id: number;
  categoryId: number;
  question: string;
  answer: string;
  difficulty: DifficultyLevelType;
  computedDifficulty: DifficultyLevelType | null;
  createdAt: string;
};
