import type {
  CategoryId,
  FlashcardId,
} from "@/domains/shared/types/branded-types";
import type { Flashcard, FlashcardDifficulty } from "../entities/Flashcard";
import type { PaginatedResult, PaginationOptions } from "./ICategoryRepository";

/**
 * Flashcard filter options
 */
export interface FlashcardFilterOptions {
  difficulty?: FlashcardDifficulty;
  searchTerm?: string; // Search in question or answer
}

/**
 * Flashcard repository interface
 *
 * Defines the contract for flashcard data access.
 */
export interface IFlashcardRepository {
  /**
   * Find flashcard by ID
   */
  findById(id: FlashcardId): Promise<Flashcard | null>;

  /**
   * Find all flashcards in a category
   */
  findByCategory(categoryId: CategoryId): Promise<Flashcard[]>;

  /**
   * Find flashcards with pagination and filters
   */
  findByCategoryPaginated(
    categoryId: CategoryId,
    options?: PaginationOptions,
    filters?: FlashcardFilterOptions,
  ): Promise<PaginatedResult<Flashcard>>;

  /**
   * Find flashcards by difficulty
   */
  findByDifficulty(
    categoryId: CategoryId,
    difficulty: FlashcardDifficulty,
  ): Promise<Flashcard[]>;

  /**
   * Find random flashcards from category
   */
  findRandomByCategory(
    categoryId: CategoryId,
    count: number,
  ): Promise<Flashcard[]>;

  /**
   * Save flashcard (insert or update)
   */
  save(flashcard: Flashcard): Promise<Flashcard>;

  /**
   * Save multiple flashcards (bulk operation)
   */
  saveMany(flashcards: Flashcard[]): Promise<Flashcard[]>;

  /**
   * Delete flashcard by ID
   */
  delete(id: FlashcardId): Promise<void>;

  /**
   * Delete multiple flashcards (bulk operation)
   */
  deleteMany(ids: FlashcardId[]): Promise<void>;

  /**
   * Check if flashcard exists
   */
  exists(id: FlashcardId): Promise<boolean>;

  /**
   * Count flashcards in category
   */
  countByCategory(categoryId: CategoryId): Promise<number>;

  /**
   * Count flashcards by difficulty in category
   */
  countByDifficulty(
    categoryId: CategoryId,
    difficulty: FlashcardDifficulty,
  ): Promise<number>;

  /**
   * Search flashcards across all categories
   */
  search(
    searchTerm: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Flashcard>>;
}
