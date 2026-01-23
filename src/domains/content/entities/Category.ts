import { ValidationError } from "@/domains/shared/errors";
import {
  CategoryId,
  type DomainId,
} from "@/domains/shared/types/branded-types";

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

  static create(
    domainId: DomainId,
    name: string,
    description: string | null,
  ): Category {
    return new Category(
      CategoryId(0),
      domainId,
      name,
      description,
      false,
      new Date(),
    );
  }

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

  updateName(newName: string): void {
    this.name = newName;
    this.validate();
  }

  updateDescription(newDescription: string | null): void {
    this.description = newDescription;
  }

  deprecate(): void {
    this.isDeprecated = true;
  }

  activate(): void {
    this.isDeprecated = false;
  }

  isNew(): boolean {
    return this.id.valueOf() === 0;
  }

  belongsToDomain(domainId: DomainId): boolean {
    return this.domainId === domainId;
  }

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
