import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for deleting a category
 */
export interface DeleteCategoryRequest {
  userId: string;
  categoryId: number;
}

/**
 * Response DTO for category deletion
 */
export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

/**
 * DeleteCategoryUseCase
 *
 * Application service that deletes a category.
 *
 * Flow:
 * 1. Validate input
 * 2. Check if category exists
 * 3. Check for dependent flashcards
 * 4. Delete category via repository
 * 5. Return result
 *
 * Note: Category deletion will cascade to flashcards if the database
 * supports cascade delete (SQLite does).
 */
export class DeleteCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly flashcardRepository: IFlashcardRepository,
  ) {}

  async execute(
    request: DeleteCategoryRequest,
  ): Promise<DeleteCategoryResponse> {
    const categoryId = CategoryId(request.categoryId);

    // Check if category exists
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    // Check for dependent flashcards (warning check)
    const flashcards =
      await this.flashcardRepository.findByCategory(categoryId);
    if (flashcards.length > 0) {
      // Note: This is informational - the delete will cascade
      console.warn(
        `Deleting category ${categoryId} with ${flashcards.length} flashcards. Flashcards will be deleted.`,
      );
    }

    // Delete category (cascades to flashcards)
    await this.categoryRepository.delete(categoryId);

    return {
      success: true,
      message: `Category deleted successfully${
        flashcards.length > 0
          ? ` along with ${flashcards.length} flashcard(s)`
          : ""
      }`,
    };
  }
}
