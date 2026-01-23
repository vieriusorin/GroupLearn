import type { UpdateCategoryResult } from "@/application/dtos/content.dto";
import type { UpdateCategoryCommand } from "@/commands/content/UpdateCategory.command";
import type { ICommandHandler } from "@/commands/types";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";

export class UpdateCategoryHandler
  implements ICommandHandler<UpdateCategoryCommand, UpdateCategoryResult>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(command: UpdateCategoryCommand): Promise<UpdateCategoryResult> {
    const categoryId = CategoryId(command.categoryId);

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    if (command.name !== undefined) {
      if (!command.name || !command.name.trim()) {
        throw new DomainError(
          "Category name cannot be empty",
          "VALIDATION_ERROR",
        );
      }
      category.updateName(command.name.trim());
    }

    if (command.description !== undefined) {
      category.updateDescription(command.description?.trim() || null);
    }

    const updatedCategory = await this.categoryRepository.save(category);

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
