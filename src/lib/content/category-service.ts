import {
  createCategoryCommand,
  deleteCategoryCommand,
  updateCategoryCommand,
} from "@/commands";
import type { Category } from "@/infrastructure/database/schema";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import {
  getCategoriesQuery,
  getCategoryByIdQuery,
  getDomainByIdQuery,
  getFlashcardsQuery,
} from "@/queries";

export class CategoryService {
  static async getByDomain(
    domainId: number,
    page?: number,
    limit?: number,
  ): Promise<
    | { data: Category[]; total: number; page: number; limit: number }
    | Category[]
  > {
    const domainQuery = getDomainByIdQuery(domainId);
    const domain =
      await queryHandlers.content.getDomainById.execute(domainQuery);
    if (!domain) {
      throw new Error(`Domain with ID ${domainId} not found`);
    }

    const categoriesQuery = getCategoriesQuery(domainId);
    const categoriesResult =
      await queryHandlers.content.getCategories.execute(categoriesQuery);
    const allCategories = categoriesResult.categories.map((cat) => ({
      id: cat.id,
      domainId: cat.domainId,
      name: cat.name,
      description: cat.description,
      createdAt: new Date(cat.createdAt),
      createdBy: null,
      isDeprecated: false,
    })) as Category[];

    if (page === undefined || limit === undefined) {
      return allCategories;
    }

    const offset = (page - 1) * limit;
    const paginatedData = allCategories.slice(offset, offset + limit);

    return {
      data: paginatedData,
      total: allCategories.length,
      page,
      limit,
    };
  }

  static async getById(id: number): Promise<Category> {
    const query = getCategoryByIdQuery(id);
    const category = await queryHandlers.content.getCategoryById.execute(query);
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  static async create(
    userId: string,
    domainId: number,
    name: string,
    description: string | null = null,
  ): Promise<Category> {
    const domainQuery = getDomainByIdQuery(domainId);
    const domain =
      await queryHandlers.content.getDomainById.execute(domainQuery);
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

    const command = createCategoryCommand(userId, domainId, trimmedName, description);
    const result =
      await commandHandlers.content.createCategory.execute(command);
    return {
      id: result.data.id,
      domainId: result.data.domainId,
      name: result.data.name,
      description: result.data.description,
      createdAt: new Date(result.data.createdAt),
      createdBy: null,
      isDeprecated: false,
    } as Category;
  }

  static async update(
    userId: string,
    id: number,
    name: string,
    description: string | null,
  ): Promise<Category> {
    const _existing = await CategoryService.getById(id);

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Category name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Category name cannot exceed 100 characters");
    }

    if (description && description.length > 500) {
      throw new Error("Category description cannot exceed 500 characters");
    }

    const command = updateCategoryCommand(userId, id, trimmedName, description);
    await commandHandlers.content.updateCategory.execute(command);
    return CategoryService.getById(id);
  }

  static async delete(userId: string, id: number): Promise<void> {
    await CategoryService.getById(id);

    const flashcardsQuery = getFlashcardsQuery(id);
    const flashcardsResult =
      await queryHandlers.content.getFlashcards.execute(flashcardsQuery);
    if (flashcardsResult.flashcards.length > 0) {
      throw new Error(
        `Cannot delete category with ${flashcardsResult.flashcards.length} flashcards. Delete flashcards first.`,
      );
    }

    const command = deleteCategoryCommand(userId, id);
    await commandHandlers.content.deleteCategory.execute(command);
  }

  static async hasFlashcards(id: number): Promise<boolean> {
    const flashcardsQuery = getFlashcardsQuery(id);
    const flashcardsResult =
      await queryHandlers.content.getFlashcards.execute(flashcardsQuery);
    return flashcardsResult.flashcards.length > 0;
  }

  static async getFlashcardCount(id: number): Promise<number> {
    const flashcardsQuery = getFlashcardsQuery(id);
    const flashcardsResult =
      await queryHandlers.content.getFlashcards.execute(flashcardsQuery);
    return flashcardsResult.flashcards.length;
  }
}
