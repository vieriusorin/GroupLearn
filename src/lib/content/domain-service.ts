import {
  createDomainCommand,
  deleteDomainCommand,
  updateDomainCommand,
} from "@/commands";
import type { Domain } from "@/infrastructure/database/schema";
import { commandHandlers, queryHandlers } from "@/infrastructure/di/container";
import {
  getCategoriesQuery,
  getDomainByIdQuery,
  getDomainsQuery,
} from "@/queries";

export class DomainService {
  static async getAll(): Promise<Domain[]> {
    const query = getDomainsQuery();
    const result = await queryHandlers.content.getDomains.execute(query);
    return result.domains.map((domain) => ({
      id: domain.id,
      name: domain.name,
      description: domain.description,
      createdAt: new Date(domain.createdAt),
      createdBy: domain.createdBy,
    })) as Domain[];
  }

  static async getById(id: number): Promise<Domain> {
    const query = getDomainByIdQuery(id);
    const domain = await queryHandlers.content.getDomainById.execute(query);
    if (!domain) {
      throw new Error(`Domain with ID ${id} not found`);
    }
    return domain;
  }

  static async create(
    userId: string,
    name: string,
    description: string | null = null,
  ): Promise<Domain> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Domain name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Domain name cannot exceed 100 characters");
    }

    if (description && description.length > 500) {
      throw new Error("Domain description cannot exceed 500 characters");
    }

    const command = createDomainCommand(userId, trimmedName, description ?? undefined);
    const result = await commandHandlers.content.createDomain.execute(command);
    return {
      id: result.data.id,
      name: result.data.name,
      description: result.data.description,
      createdAt: new Date(result.data.createdAt),
      createdBy: result.data.createdBy ?? null,
    } as Domain;
  }

  static async update(
    userId: string,
    id: number,
    name: string,
    description: string | null,
  ): Promise<Domain> {
    const _existing = await DomainService.getById(id);

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Domain name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Domain name cannot exceed 100 characters");
    }

    if (description && description.length > 500) {
      throw new Error("Domain description cannot exceed 500 characters");
    }

    const command = updateDomainCommand(userId, id, trimmedName, description ?? undefined);
    await commandHandlers.content.updateDomain.execute(command);
    return DomainService.getById(id);
  }

  static async delete(userId: string, id: number, cascade: boolean = false): Promise<void> {
    await DomainService.getById(id);

    if (!cascade) {
      const categoriesQuery = getCategoriesQuery(id);
      const categoriesResult =
        await queryHandlers.content.getCategories.execute(categoriesQuery);
      if (categoriesResult.categories.length > 0) {
        throw new Error(
          `Cannot delete domain with ${categoriesResult.categories.length} categories. Delete categories first.`,
        );
      }
    }

    const command = deleteDomainCommand(userId, id);
    await commandHandlers.content.deleteDomain.execute(command);
  }

  /**
   * Check if a domain has any categories
   */
  static async hasCategories(id: number): Promise<boolean> {
    const categoriesQuery = getCategoriesQuery(id);
    const categoriesResult =
      await queryHandlers.content.getCategories.execute(categoriesQuery);
    return categoriesResult.categories.length > 0;
  }
}
