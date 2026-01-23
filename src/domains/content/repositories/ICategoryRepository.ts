import type {
  CategoryId,
  DomainId,
} from "@/domains/shared/types/branded-types";
import type { Category } from "../entities/Category";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ICategoryRepository {
  findById(id: CategoryId): Promise<Category | null>;
  findByDomain(domainId: DomainId): Promise<Category[]>;
  findByDomainPaginated(
    domainId: DomainId,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Category>>;
  findActiveByDomain(domainId: DomainId): Promise<Category[]>;
  save(category: Category): Promise<Category>;
  delete(id: CategoryId): Promise<void>;
  exists(id: CategoryId): Promise<boolean>;
  existsByNameInDomain(
    domainId: DomainId,
    name: string,
    excludeId?: CategoryId,
  ): Promise<boolean>;
  countByDomain(domainId: DomainId): Promise<number>;
  countFlashcards(id: CategoryId): Promise<number>;
}
