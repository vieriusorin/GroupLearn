import { and, count, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { Flashcard } from "@/domains/content/entities/Flashcard";
import type {
  PaginatedResult,
  PaginationOptions,
} from "@/domains/content/repositories/ICategoryRepository";
import type {
  FlashcardFilterOptions,
  IFlashcardRepository,
} from "@/domains/content/repositories/IFlashcardRepository";
import { DomainError } from "@/domains/shared/errors";
import { CategoryId, FlashcardId } from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import type { DifficultyLevelType } from "@/infrastructure/database/schema";
import { flashcards } from "@/infrastructure/database/schema/content.schema";

/**
 * Drizzle/PostgreSQL implementation of Flashcard repository
 */
export class SqliteFlashcardRepository implements IFlashcardRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: FlashcardId): Promise<Flashcard | null> {
    const rows = await this.db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToFlashcard(row);
  }

  async findByCategory(categoryId: CategoryId): Promise<Flashcard[]> {
    const rows = await this.db
      .select()
      .from(flashcards)
      .where(eq(flashcards.categoryId, categoryId as number))
      .orderBy(desc(flashcards.createdAt));

    return rows.map((row) => this.mapToFlashcard(row));
  }

  async findByCategoryPaginated(
    categoryId: CategoryId,
    options?: PaginationOptions,
    filters?: FlashcardFilterOptions,
  ): Promise<PaginatedResult<Flashcard>> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [eq(flashcards.categoryId, categoryId as number)];

    if (filters?.difficulty) {
      conditions.push(eq(flashcards.difficulty, filters.difficulty));
    }

    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm;
      const searchPattern = `%${searchTerm}%`;
      conditions.push(
        or(
          like(flashcards.question, searchPattern),
          like(flashcards.answer, searchPattern),
        )!,
      );
    }

    const where = and(...conditions);

    const rows = await this.db
      .select()
      .from(flashcards)
      .where(where)
      .orderBy(desc(flashcards.createdAt))
      .limit(limit)
      .offset(offset);

    const items = rows.map((row) => this.mapToFlashcard(row));

    const [countRow] = await this.db
      .select({ count: count() })
      .from(flashcards)
      .where(where);

    const total = Number(countRow?.count ?? 0);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByDifficulty(
    categoryId: CategoryId,
    difficulty: DifficultyLevelType,
  ): Promise<Flashcard[]> {
    const rows = await this.db
      .select()
      .from(flashcards)
      .where(
        and(
          eq(flashcards.categoryId, categoryId as number),
          eq(flashcards.difficulty, difficulty),
        ),
      )
      .orderBy(desc(flashcards.createdAt));

    return rows.map((row) => this.mapToFlashcard(row));
  }

  async findRandomByCategory(
    categoryId: CategoryId,
    count: number,
  ): Promise<Flashcard[]> {
    const rows = await this.db
      .select()
      .from(flashcards)
      .where(eq(flashcards.categoryId, categoryId as number))
      .orderBy(sql`RANDOM()`)
      .limit(count);

    return rows.map((row) => this.mapToFlashcard(row));
  }

  async save(flashcard: Flashcard): Promise<Flashcard> {
    if (flashcard.isNew()) {
      const [inserted] = await this.db
        .insert(flashcards)
        .values({
          categoryId: flashcard.getCategoryId() as number,
          question: flashcard.getQuestion(),
          answer: flashcard.getAnswer(),
          difficulty: flashcard.getDifficulty(),
          computedDifficulty: flashcard.getComputedDifficulty(),
          createdAt: flashcard.getCreatedAt(),
        })
        .returning();

      return Flashcard.reconstitute(
        FlashcardId(inserted.id),
        CategoryId(inserted.categoryId),
        inserted.question,
        inserted.answer,
        inserted.difficulty as any,
        inserted.computedDifficulty as any,
        inserted.createdAt,
      );
    } else {
      await this.db
        .update(flashcards)
        .set({
          categoryId: flashcard.getCategoryId() as number,
          question: flashcard.getQuestion(),
          answer: flashcard.getAnswer(),
          difficulty: flashcard.getDifficulty(),
          computedDifficulty: flashcard.getComputedDifficulty(),
        })
        .where(eq(flashcards.id, flashcard.getId() as number));

      return flashcard;
    }
  }

  async saveMany(flashcards: Flashcard[]): Promise<Flashcard[]> {
    const saved: Flashcard[] = [];

    for (const flashcard of flashcards) {
      const savedFlashcard = await this.save(flashcard);
      saved.push(savedFlashcard);
    }

    return saved;
  }

  async delete(id: FlashcardId): Promise<void> {
    const result = await this.db
      .delete(flashcards)
      .where(eq(flashcards.id, id as number));

    if ((result.rowCount ?? 0) === 0) {
      throw new DomainError("Flashcard not found", "FLASHCARD_NOT_FOUND");
    }
  }

  async deleteMany(ids: FlashcardId[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db.delete(flashcards).where(
      inArray(
        flashcards.id,
        ids.map((id) => id as number),
      ),
    );
  }

  async exists(id: FlashcardId): Promise<boolean> {
    const rows = await this.db
      .select({ id: flashcards.id })
      .from(flashcards)
      .where(eq(flashcards.id, id as number))
      .limit(1);

    return rows.length > 0;
  }

  async countByCategory(categoryId: CategoryId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(flashcards)
      .where(eq(flashcards.categoryId, categoryId as number));

    return Number(row?.count ?? 0);
  }

  async countByDifficulty(
    categoryId: CategoryId,
    difficulty: DifficultyLevelType,
  ): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(flashcards)
      .where(
        and(
          eq(flashcards.categoryId, categoryId as number),
          eq(flashcards.difficulty, difficulty),
        ),
      );

    return Number(row?.count ?? 0);
  }

  async search(
    searchTerm: string,
    options?: PaginationOptions,
  ): Promise<PaginatedResult<Flashcard>> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const searchPattern = `%${searchTerm}%`;

    const where = or(
      like(flashcards.question, searchPattern),
      like(flashcards.answer, searchPattern),
    );

    const rows = await this.db
      .select()
      .from(flashcards)
      .where(where)
      .orderBy(desc(flashcards.createdAt))
      .limit(limit)
      .offset(offset);

    const items = rows.map((row) => this.mapToFlashcard(row));

    const [countRow] = await this.db
      .select({ count: count() })
      .from(flashcards)
      .where(where);

    const total = Number(countRow?.count ?? 0);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Map database row to Flashcard entity
   */
  private mapToFlashcard(row: {
    id: number;
    categoryId: number;
    question: string;
    answer: string;
    difficulty: string;
    computedDifficulty: string | null;
    createdAt: Date;
  }): Flashcard {
    return Flashcard.reconstitute(
      FlashcardId(row.id),
      CategoryId(row.categoryId),
      row.question,
      row.answer,
      (row.difficulty || "medium") as any,
      (row.computedDifficulty || null) as any,
      row.createdAt,
    );
  }
}
