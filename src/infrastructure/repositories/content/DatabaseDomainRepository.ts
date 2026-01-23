import { count, desc, eq } from "drizzle-orm";
import { Domain } from "@/domains/content/entities/Domain";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import type { Domain as DomainRow } from "@/infrastructure/database/schema";
import {
  categories,
  domains,
} from "@/infrastructure/database/schema/content.schema";

/**
 * Database implementation of Domain repository
 */
export class DatabaseDomainRepository implements IDomainRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: DomainId): Promise<Domain | null> {
    const rows = await this.db
      .select()
      .from(domains)
      .where(eq(domains.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToDomain(row);
  }

  async findAll(): Promise<Domain[]> {
    const rows = await this.db.select().from(domains).orderBy(domains.name);

    return rows.map((row) => this.mapToDomain(row));
  }

  async findByCreator(_userId: string): Promise<Domain[]> {
    const rows = await this.db
      .select()
      .from(domains)
      // createdBy is not yet modelled in the PostgreSQL schema; this falls back
      // to returning all domains ordered by creation date.
      .orderBy(desc(domains.createdAt));

    return rows.map((row) => this.mapToDomain(row));
  }

  async save(domain: Domain): Promise<Domain> {
    if (domain.isNew()) {
      // Insert new domain
      const [inserted] = await this.db
        .insert(domains)
        .values({
          name: domain.getName(),
          description: domain.getDescription(),
          createdAt: domain.getCreatedAt(),
        })
        .returning();

      return Domain.reconstitute(
        DomainId(inserted.id),
        inserted.name,
        inserted.description,
        inserted.createdAt,
        undefined,
      );
    } else {
      // Update existing domain
      await this.db
        .update(domains)
        .set({
          name: domain.getName(),
          description: domain.getDescription(),
        })
        .where(eq(domains.id, domain.getId() as number));

      return domain;
    }
  }

  async delete(id: DomainId): Promise<void> {
    // Check if domain has categories
    const [categoryCount] = await this.db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.domainId, id as number));

    if (Number(categoryCount?.count ?? 0) > 0) {
      throw new DomainError(
        "Cannot delete domain with categories. Delete categories first.",
        "DOMAIN_HAS_CATEGORIES",
      );
    }

    const result = await this.db
      .delete(domains)
      .where(eq(domains.id, id as number));

    if ((result.rowCount ?? 0) === 0) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }
  }

  async existsByName(name: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: domains.id })
      .from(domains)
      .where(eq(domains.name, name))
      .limit(1);

    return rows.length > 0;
  }

  async exists(id: DomainId): Promise<boolean> {
    const rows = await this.db
      .select({ id: domains.id })
      .from(domains)
      .where(eq(domains.id, id as number))
      .limit(1);

    return rows.length > 0;
  }

  async count(): Promise<number> {
    const [row] = await this.db.select({ count: count() }).from(domains);

    return Number(row?.count ?? 0);
  }

  /**
   * Map database row to Domain entity
   */
  private mapToDomain(row: DomainRow): Domain {
    return Domain.reconstitute(
      DomainId(row.id),
      row.name,
      row.description,
      row.createdAt,
      undefined,
    );
  }
}
