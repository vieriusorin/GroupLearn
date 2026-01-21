import { ValidationError } from "@/domains/shared/errors";
import {
  CategoryId,
  type DomainId,
} from "@/domains/shared/types/branded-types";

/**
 * Category entity
 *
 * Represents a category within a domain (e.g., "Verbs" in Spanish domain).
 * Categories organize flashcards into logical groups.
 */
export class Category {
  private constructor(
    public readonly id: CategoryId,
    public readonly domainId: DomainId,
    private name: string,
    private description: string | null,
    private isDeprecated: boolean,
    public readonly createdAt: Date,
  ) {
    this.validate();
  }

  /**
   * Create a new category (not yet persisted)
   */
  static create(
    domainId: DomainId,
    name: string,
    description: string | null,
  ): Category {
    return new Category(
      CategoryId(0), // ID will be assigned by repository
      domainId,
      name,
      description,
      false, // Not deprecated by default
      new Date(),
    );
  }

  /**
   * Reconstitute category from database
   */
  static reconstitute(
    id: CategoryId,
    domainId: DomainId,
    name: string,
    description: string | null,
    isDeprecated: boolean,
    createdAt: Date,
  ): Category {
    return new Category(
      id,
      domainId,
      name,
      description,
      isDeprecated,
      createdAt,
    );
  }

  /**
   * Update category name
   */
  updateName(newName: string): void {
    this.name = newName;
    this.validate();
  }

  /**
   * Update category description
   */
  updateDescription(newDescription: string | null): void {
    this.description = newDescription;
  }

  /**
   * Mark category as deprecated
   * Deprecated categories can still be viewed but not used for new flashcards
   */
  deprecate(): void {
    this.isDeprecated = true;
  }

  /**
   * Mark category as active (un-deprecate)
   */
  activate(): void {
    this.isDeprecated = false;
  }

  /**
   * Check if category is new (not yet persisted)
   */
  isNew(): boolean {
    return this.id.valueOf() === 0;
  }

  /**
   * Check if category belongs to a specific domain
   */
  belongsToDomain(domainId: DomainId): boolean {
    return this.domainId === domainId;
  }

  /**
   * Validate category invariants
   */
  private validate(): void {
    if (!this.name || !this.name.trim()) {
      throw new ValidationError("Category name cannot be empty");
    }

    if (this.name.length > 100) {
      throw new ValidationError("Category name cannot exceed 100 characters");
    }

    if (this.description && this.description.length > 500) {
      throw new ValidationError(
        "Category description cannot exceed 500 characters",
      );
    }
  }

  // Getters

  getName(): string {
    return this.name;
  }

  getDescription(): string | null {
    return this.description;
  }

  getIsDeprecated(): boolean {
    return this.isDeprecated;
  }

  getDomainId(): DomainId {
    return this.domainId;
  }

  getId(): CategoryId {
    return this.id;
  }

  getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  /**
   * Convert to plain object for serialization
   */
  toObject() {
    return {
      id: this.id,
      domainId: this.domainId,
      name: this.name,
      description: this.description,
      isDeprecated: this.isDeprecated,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
