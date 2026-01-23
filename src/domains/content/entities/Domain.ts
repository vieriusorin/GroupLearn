import { ValidationError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

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

  static create(
    name: string,
    description: string | null,
    createdBy?: string | null,
  ): Domain {
    return new Domain(DomainId(0), name, description, new Date(), createdBy);
  }

  static reconstitute(
    id: DomainId,
    name: string,
    description: string | null,
    createdAt: Date,
    createdBy?: string | null,
  ): Domain {
    return new Domain(id, name, description, createdAt, createdBy);
  }

  updateName(newName: string): void {
    this.name = newName;
    this.validate();
  }

  updateDescription(newDescription: string | null): void {
    this.description = newDescription;
  }

  isNew(): boolean {
    return this.id.valueOf() === 0;
  }

  isOwnedBy(userId: string): boolean {
    return this.createdBy === userId;
  }

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
