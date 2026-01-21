import type { DomainId } from "@/domains/shared/types/branded-types";
import type { Domain } from "../entities/Domain";

/**
 * Domain repository interface
 *
 * Defines the contract for domain data access.
 * Implementations can use SQLite, Postgres, or in-memory storage.
 */
export interface IDomainRepository {
  /**
   * Find domain by ID
   * @returns Domain or null if not found
   */
  findById(id: DomainId): Promise<Domain | null>;

  /**
   * Find all domains
   * @returns Array of all domains
   */
  findAll(): Promise<Domain[]>;

  /**
   * Find domains created by a specific user
   */
  findByCreator(userId: string): Promise<Domain[]>;

  /**
   * Save domain (insert or update)
   * @returns Saved domain with ID
   */
  save(domain: Domain): Promise<Domain>;

  /**
   * Delete domain by ID
   * @throws Error if domain has categories
   */
  delete(id: DomainId): Promise<void>;

  /**
   * Check if domain exists by name
   */
  existsByName(name: string): Promise<boolean>;

  /**
   * Check if domain exists by ID
   */
  exists(id: DomainId): Promise<boolean>;

  /**
   * Count total domains
   */
  count(): Promise<number>;
}
