import { ValidationError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

/**
 * Domain entity
 *
 * Represents a top-level learning domain (e.g., "Spanish", "Mathematics").
 * Domains contain categories, which in turn contain flashcards.
 */
export class Domain {
  private constructor(
    public readonly id: DomainId,
    private name: string,
    private description: string | null,
    public readonly createdAt: Date,
    private createdBy?: string | null,
  ) {
    this.validate();
  }

  /**
   * Create a new domain (not yet persisted)
   */
  static create(
    name: string,
    description: string | null,
    createdBy?: string | null,
  ): Domain {
    return new Domain(
      DomainId(0), // ID will be assigned by repository
      name,
      description,
      new Date(),
      createdBy,
    );
  }

  /**
   * Reconstitute domain from database
   * Use this when loading existing domains from persistence
   */
  static reconstitute(
    id: DomainId,
    name: string,
    description: string | null,
    createdAt: Date,
    createdBy?: string | null,
  ): Domain {
    return new Domain(id, name, description, createdAt, createdBy);
  }

  /**
   * Update domain name
   */
  updateName(newName: string): void {
    this.name = newName;
    this.validate();
  }

  /**
   * Update domain description
   */
  updateDescription(newDescription: string | null): void {
    this.description = newDescription;
  }

  /**
   * Check if domain is new (not yet persisted)
   */
  isNew(): boolean {
    return this.id.valueOf() === 0;
  }

  /**
   * Check if domain is owned by specific user
   */
  isOwnedBy(userId: string): boolean {
    return this.createdBy === userId;
  }

  /**
   * Validate domain invariants
   */
  private validate(): void {
    if (!this.name || !this.name.trim()) {
      throw new ValidationError("Domain name cannot be empty");
    }

    if (this.name.length > 100) {
      throw new ValidationError("Domain name cannot exceed 100 characters");
    }

    if (this.description && this.description.length > 500) {
      throw new ValidationError(
        "Domain description cannot exceed 500 characters",
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

  getCreatedBy(): string | null | undefined {
    return this.createdBy;
  }

  getId(): DomainId {
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
      name: this.name,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      createdBy: this.createdBy,
    };
  }
}
