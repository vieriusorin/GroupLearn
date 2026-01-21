import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for updating a category
 */
export interface UpdateCategoryRequest {
  userId: string;
  categoryId: number;
  name?: string;
  description?: string | null;
}

/**
 * Response DTO for category update
 */
export interface UpdateCategoryResponse {
  success: boolean;
  data: {
    id: number;
    domainId: number;
    name: string;
    description: string | null;
    createdAt: string;
  };
}

/**
 * UpdateCategoryUseCase
 *
 * Application service that updates an existing category.
 *
 * Flow:
 * 1. Validate input
 * 2. Fetch existing category
 * 3. Update category entity
 * 4. Save via repository
 * 5. Return DTO
 */
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(
    request: UpdateCategoryRequest,
  ): Promise<UpdateCategoryResponse> {
    const categoryId = CategoryId(request.categoryId);

    // Fetch existing category
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    // Update name if provided
    if (request.name !== undefined) {
      if (!request.name || !request.name.trim()) {
        throw new DomainError(
          "Category name cannot be empty",
          "VALIDATION_ERROR",
        );
      }
      category.updateName(request.name.trim());
    }

    // Update description if provided
    if (request.description !== undefined) {
      category.updateDescription(request.description?.trim() || null);
    }

    // Save via repository
    const updatedCategory = await this.categoryRepository.save(category);

    // Return DTO
    return {
      success: true,
      data: {
        id: updatedCategory.getId() as number,
        domainId: updatedCategory.getDomainId() as number,
        name: updatedCategory.getName(),
        description: updatedCategory.getDescription(),
        createdAt: updatedCategory.getCreatedAt().toISOString(),
      },
    };
  }
}
