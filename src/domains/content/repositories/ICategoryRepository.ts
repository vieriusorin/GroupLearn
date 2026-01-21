import type {
  CategoryId,
  DomainId,
} from "@/domains/shared/types/branded-types";
import type { Category } from "../entities/Category";

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Category repository interface
 *
 * Defines the contract for category data access.
 */
export interface ICategoryRepository {
  /**
   * Find category by ID
   */
  findById(id: CategoryId): Promise<Category | null>;

  /**
   * Find all categories in a domain
   */
  findByDomain(domainId: DomainId): Promise<Category[]>;

  /**
   * Find categories with pagination
   */
  findByDomainPaginated(
    domainId: DomainId,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Category>>;

  /**
   * Find non-deprecated categories in a domain
   */
  findActiveByDomain(domainId: DomainId): Promise<Category[]>;

  /**
   * Save category (insert or update)
   */
  save(category: Category): Promise<Category>;

  /**
   * Delete category by ID
   * @throws Error if category has flashcards
   */
  delete(id: CategoryId): Promise<void>;

  /**
   * Check if category exists by ID
   */
  exists(id: CategoryId): Promise<boolean>;

  /**
   * Check if category name exists in domain
   */
  existsByNameInDomain(
    domainId: DomainId,
    name: string,
    excludeId?: CategoryId,
  ): Promise<boolean>;

  /**
   * Count categories in domain
   */
  countByDomain(domainId: DomainId): Promise<number>;

  /**
   * Count flashcards in category
   */
  countFlashcards(id: CategoryId): Promise<number>;
}
