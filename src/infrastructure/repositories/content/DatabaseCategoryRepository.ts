import { and, count, eq, ne } from "drizzle-orm";
import { Category } from "@/domains/content/entities/Category";
import type {
  ICategoryRepository,
  PaginatedResult,
  PaginationOptions,
} from "@/domains/content/repositories/ICategoryRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId, DomainId } from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import type { Category as CategoryRow } from "@/infrastructure/database/schema";
import {
  categories,
  flashcards,
} from "@/infrastructure/database/schema/content.schema";

export class DatabaseCategoryRepository implements ICategoryRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: CategoryId): Promise<Category | null> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToCategory(row);
  }

  async findByDomain(domainId: DomainId): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.domainId, domainId as number))
      .orderBy(categories.name);

    return rows.map((row) => this.mapToCategory(row));
  }

  async findByDomainPaginated(
    domainId: DomainId,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Category>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const [countRow] = await this.db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.domainId, domainId as number));

    const total = Number(countRow?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    const rows = await this.db
      .select()
      .from(categories)
      .where(eq(categories.domainId, domainId as number))
      .orderBy(categories.name)
      .limit(limit)
      .offset(offset);

    const items = rows.map((row) => this.mapToCategory(row));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findActiveByDomain(domainId: DomainId): Promise<Category[]> {
    const rows = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.domainId, domainId as number),
          eq(categories.isDeprecated, false),
        ),
      )
      .orderBy(categories.name);

    return rows.map((row) => this.mapToCategory(row));
  }

  async save(category: Category): Promise<Category> {
    if (category.isNew()) {
      const [inserted] = await this.db
        .insert(categories)
        .values({
          domainId: category.getDomainId() as number,
          name: category.getName(),
          description: category.getDescription(),
          isDeprecated: category.getIsDeprecated(),
          createdAt: category.getCreatedAt(),
        })
        .returning();

      return Category.reconstitute(
        CategoryId(inserted.id),
        category.getDomainId(),
        category.getName(),
        category.getDescription(),
        category.getIsDeprecated(),
        category.getCreatedAt(),
      );
    } else {
      await this.db
        .update(categories)
        .set({
          name: category.getName(),
          description: category.getDescription(),
          isDeprecated: category.getIsDeprecated(),
        })
        .where(eq(categories.id, category.getId() as number));

      return category;
    }
  }

  async delete(id: CategoryId): Promise<void> {
    const [flashcardCount] = await this.db
      .select({ count: count() })
      .from(flashcards)
      .where(eq(flashcards.categoryId, id as number));

    if (Number(flashcardCount?.count ?? 0) > 0) {
      throw new DomainError(
        "Cannot delete category with flashcards. Delete flashcards first.",
        "CATEGORY_HAS_FLASHCARDS",
      );
    }

    const result = await this.db
      .delete(categories)
      .where(eq(categories.id, id as number));

    if ((result.rowCount ?? 0) === 0) {
      throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
    }
  }

  async exists(id: CategoryId): Promise<boolean> {
    const rows = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id as number))
      .limit(1);

    return rows.length > 0;
  }

  async existsByNameInDomain(
    domainId: DomainId,
    name: string,
    excludeId?: CategoryId,
  ): Promise<boolean> {
    const conditions = [
      eq(categories.domainId, domainId as number),
      eq(categories.name, name),
    ];

    const where = excludeId
      ? and(...conditions, ne(categories.id, excludeId as number))
      : and(...conditions);

    const rows = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(where)
      .limit(1);

    return rows.length > 0;
  }

  async countByDomain(domainId: DomainId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.domainId, domainId as number));

    return Number(row?.count ?? 0);
  }

  async countFlashcards(id: CategoryId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(flashcards)
      .where(eq(flashcards.categoryId, id as number));

    return Number(row?.count ?? 0);
  }

  private mapToCategory(row: CategoryRow): Category {
    return Category.reconstitute(
      CategoryId(row.id),
      DomainId(row.domainId),
      row.name,
      row.description,
      row.isDeprecated,
      row.createdAt,
    );
  }
}
