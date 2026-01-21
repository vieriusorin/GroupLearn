import {
  createDomain as dbCreateDomain,
  deleteDomain as dbDeleteDomain,
  updateDomain as dbUpdateDomain,
  getAllDomains,
  getCategoriesByDomain,
  getDomainById,
} from "../db-operations";
import type { Domain } from "../types";

/**
 * Domain Service
 * Handles business logic for domain management
 */
export class DomainService {
  /**
   * Get all domains, sorted by creation date
   */
  static async getAll(): Promise<Domain[]> {
    return getAllDomains();
  }

  /**
   * Get a domain by ID
   * @throws Error if domain not found
   */
  static async getById(id: number): Promise<Domain> {
    const domain = await getDomainById(id);
    if (!domain) {
      throw new Error(`Domain with ID ${id} not found`);
    }
    return domain;
  }

  /**
   * Create a new domain
   * @throws Error if name is empty or too long
   */
  static async create(
    name: string,
    description: string | null = null,
  ): Promise<Domain> {
    // Business logic: validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Domain name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Domain name cannot exceed 100 characters");
    }

    // Business logic: validate description
    if (description && description.length > 500) {
      throw new Error("Domain description cannot exceed 500 characters");
    }

    return dbCreateDomain(trimmedName, description);
  }

  /**
   * Update an existing domain
   * @throws Error if domain not found or validation fails
   */
  static async update(
    id: number,
    name: string,
    description: string | null,
  ): Promise<Domain> {
    // Verify domain exists
    const _existing = await DomainService.getById(id);

    // Business logic: validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("Domain name cannot be empty");
    }
    if (trimmedName.length > 100) {
      throw new Error("Domain name cannot exceed 100 characters");
    }

    // Business logic: validate description
    if (description && description.length > 500) {
      throw new Error("Domain description cannot exceed 500 characters");
    }

    await dbUpdateDomain(id, trimmedName, description);
    return DomainService.getById(id);
  }

  /**
   * Delete a domain
   * @param cascade If true, allows deletion even if domain has categories (cascade delete)
   * @throws Error if domain has categories and cascade is false
   */
  static async delete(id: number, cascade: boolean = false): Promise<void> {
    // Verify domain exists
    await DomainService.getById(id);

    // Business logic: prevent deletion if domain has categories (unless cascade is enabled)
    if (!cascade) {
      const categories = await getCategoriesByDomain(id);
      if (categories.length > 0) {
        throw new Error(
          `Cannot delete domain with ${categories.length} categories. Delete categories first.`,
        );
      }
    }

    // If cascade is true, the database will handle cascade deletion via foreign key constraints
    await dbDeleteDomain(id);
  }

  /**
   * Check if a domain has any categories
   */
  static async hasCategories(id: number): Promise<boolean> {
    const categories = await getCategoriesByDomain(id);
    return categories.length > 0;
  }
}
