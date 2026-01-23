import type { DeleteResult } from "@/application/dtos/content.dto";
import type { DeleteCategoryCommand } from "@/commands/content/DeleteCategory.command";
import type { ICommandHandler } from "@/commands/types";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IFlashcardRepository } from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId } from "@/domains/shared/types/branded-types";

export class DeleteCategoryHandler
  implements ICommandHandler<DeleteCategoryCommand, DeleteResult>
{
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly flashcardRepository: IFlashcardRepository,
  ) {}

  async execute(command: DeleteCategoryCommand): Promise<DeleteResult> {
    const categoryId = CategoryId(command.categoryId);

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }

    const flashcards =
      await this.flashcardRepository.findByCategory(categoryId);
    if (flashcards.length > 0) {
      console.warn(
        `Deleting category ${categoryId} with ${flashcards.length} flashcards. Flashcards will be deleted.`,
      );
    }

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
