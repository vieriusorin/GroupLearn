import type {
  CategoryId,
  FlashcardId,
} from "@/domains/shared/types/branded-types";
import type { Flashcard, FlashcardDifficulty } from "../entities/Flashcard";
import type { PaginatedResult, PaginationOptions } from "./ICategoryRepository";

export interface FlashcardFilterOptions {
  difficulty?: FlashcardDifficulty;
  searchTerm?: string; // Search in question or answer
}

export interface IFlashcardRepository {
  findById(id: FlashcardId): Promise<Flashcard | null>;
  findByCategory(categoryId: CategoryId): Promise<Flashcard[]>;
  findByCategoryPaginated(
    categoryId: CategoryId,
    options?: PaginationOptions,
    filters?: FlashcardFilterOptions,
  ): Promise<PaginatedResult<Flashcard>>;
  findByDifficulty(
    categoryId: CategoryId,
    difficulty: FlashcardDifficulty,
  ): Promise<Flashcard[]>;
  findRandomByCategory(
    categoryId: CategoryId,
    count: number,
  ): Promise<Flashcard[]>;
  save(flashcard: Flashcard): Promise<Flashcard>;
  saveMany(flashcards: Flashcard[]): Promise<Flashcard[]>;
  delete(id: FlashcardId): Promise<void>;
  deleteMany(ids: FlashcardId[]): Promise<void>;
  exists(id: FlashcardId): Promise<boolean>;
  countByCategory(categoryId: CategoryId): Promise<number>;
  countByDifficulty(
    categoryId: CategoryId,
    difficulty: FlashcardDifficulty,
  ): Promise<number>;
  search(
    searchTerm: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Flashcard>>;
}
