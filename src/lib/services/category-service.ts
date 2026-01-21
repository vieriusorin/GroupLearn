import {
  createCategory as dbCreateCategory,
  deleteCategory as dbDeleteCategory,
  updateCategory as dbUpdateCategory,
  getCategoriesByDomain,
  getCategoryById,
  getDomainById,
  getFlashcardsByCategory,
} from "../db-operations";
import type { Category } from "../types";

/**
 * Category Service
 * Handles business logic for category management
 */
export class CategoryService {
  /**
   * Get all categories for a domain with pagination
   * @throws Error if domain not found
   */
  static async getByDomain(
    domainId: number,
    page?: number,
    limit?: number,
  ): Promise<
    | { data: Category[]; total: number; page: number; limit: number }
    | Category[]
  > {
    // Verify domain exists
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    const allCategories = await getCategoriesByDomain(domainId);

    // If no pagination params, return all categories (backward compatible)
    if (page === undefined || limit === undefined) {
      return allCategories;
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedData = allCategories.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total: allCategories.length,
      page,
      limit,
    };
  }

  /**
   * Get a category by ID
   * @throws Error if category not found
   */
  static async getById(id: number): Promise<Category> {
    const category = await getCategoryById(id);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  /**
   * Create a new category
   * @throws Error if validation fails
   */
  static async create(
    domainId: number,
    name: string,
    description: string | null = null,
  ): Promise<Category> {
    // Verify domain exists
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    // Business logic: validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Category name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Category name cannot exceed 100 characters");
    }

    // Business logic: validate description
    if (description && description.length > 500) {
      throw new Error("Category description cannot exceed 500 characters");
    }

    return dbCreateCategory(domainId, trimmedName, description);
  }

  /**
   * Update an existing category
   * @throws Error if category not found or validation fails
   */
  static async update(
    id: number,
    name: string,
    description: string | null,
  ): Promise<Category> {
    // Verify category exists
    const _existing = await CategoryService.getById(id);

    // Business logic: validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Category name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Category name cannot exceed 100 characters");
    }

    // Business logic: validate description
    if (description && description.length > 500) {
      throw new Error("Category description cannot exceed 500 characters");
    }

    await dbUpdateCategory(id, trimmedName, description);
    return CategoryService.getById(id);
  }

  /**
   * Delete a category
   * @throws Error if category has flashcards
   */
  static async delete(id: number): Promise<void> {
    // Verify category exists
    await CategoryService.getById(id);

    // Business logic: prevent deletion if category has flashcards
    const flashcards = await getFlashcardsByCategory(id);
    if (flashcards.length > 0) {
      throw new Error(
        `Cannot delete category with ${flashcards.length} flashcards. Delete flashcards first.`,
      );
    }

    await dbDeleteCategory(id);
  }

  /**
   * Check if a category has any flashcards
   */
  static async hasFlashcards(id: number): Promise<boolean> {
    const flashcards = await getFlashcardsByCategory(id);
    return flashcards.length > 0;
  }

  /**
   * Get flashcard count for a category
   */
  static async getFlashcardCount(id: number): Promise<number> {
    const flashcards = await getFlashcardsByCategory(id);
    return flashcards.length;
  }
}
