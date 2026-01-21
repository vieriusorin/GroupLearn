import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  categories as categoriesTable,
  type DifficultyLevelType,
  domains as domainsTable,
  flashcards as flashcardsTable,
  reviewHistory as reviewHistoryTable,
  strugglingQueue as strugglingQueueTable,
} from "@/infrastructure/database/schema";
import type {
  Category,
  Domain,
  Flashcard,
  ReviewHistory,
  ReviewMode,
  StrugglingCard,
} from "./types";

const mapDomain = (row: typeof domainsTable.$inferSelect): Domain => ({
  id: row.id,
  name: row.name,
  description: row.description ?? null,
  created_at: row.createdAt.toISOString(),
});

const mapCategory = (row: typeof categoriesTable.$inferSelect): Category => ({
  id: row.id,
  domain_id: row.domainId,
  name: row.name,
  description: row.description ?? null,
  created_at: row.createdAt.toISOString(),
});

const mapFlashcard = (row: typeof flashcardsTable.$inferSelect): Flashcard => ({
  id: row.id,
  category_id: row.categoryId,
  question: row.question,
  answer: row.answer,
  difficulty: row.difficulty as Flashcard["difficulty"],
  created_at: row.createdAt.toISOString(),
});

const mapReviewHistory = (
  row: typeof reviewHistoryTable.$inferSelect,
): ReviewHistory => ({
  id: row.id,
  flashcard_id: row.flashcardId,
  review_mode: ((): ReviewMode => {
    if (row.reviewMode === "learn") return "flashcard";
    if (row.reviewMode === "review") return "quiz";
    return "recall";
  })(),
  is_correct: row.isCorrect,
  review_date: row.reviewDate.toISOString(),
  next_review_date: row.nextReviewDate.toISOString().split("T")[0],
  interval_days: row.intervalDays,
});

const mapStrugglingCard = (
  row: typeof strugglingQueueTable.$inferSelect,
): StrugglingCard => ({
  id: row.id,
  flashcard_id: row.flashcardId,
  added_at: row.addedAt.toISOString(),
  times_failed: row.timesFailed,
  last_failed_at: row.lastFailedAt.toISOString(),
});

export async function getAllDomains(): Promise<Domain[]> {
  const rows = await db
    .select()
    .from(domainsTable)
    .orderBy(desc(domainsTable.createdAt));
  return rows.map(mapDomain);
}

export async function getDomainById(id: number): Promise<Domain | undefined> {
  const [row] = await db
    .select()
    .from(domainsTable)
    .where(eq(domainsTable.id, id))
    .limit(1);
  return row ? mapDomain(row) : undefined;
}

export async function createDomain(
  name: string,
  description: string | null = null,
): Promise<Domain> {
  const [inserted] = await db
    .insert(domainsTable)
    .values({ name, description: description ?? null })
    .returning();
  return mapDomain(inserted);
}

export async function updateDomain(
  id: number,
  name: string,
  description: string | null,
): Promise<void> {
  await db
    .update(domainsTable)
    .set({ name, description: description ?? null })
    .where(eq(domainsTable.id, id));
}

export async function deleteDomain(id: number): Promise<void> {
  await db.delete(domainsTable).where(eq(domainsTable.id, id));
}

export async function getCategoriesByDomain(
  domainId: number,
): Promise<Category[]> {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.domainId, domainId))
    .orderBy(desc(categoriesTable.createdAt));

  return rows.map(mapCategory);
}

export async function getCategoryById(
  id: number,
): Promise<Category | undefined> {
  const [row] = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, id))
    .limit(1);
  return row ? mapCategory(row) : undefined;
}

export async function createCategory(
  domainId: number,
  name: string,
  description: string | null = null,
): Promise<Category> {
  const [inserted] = await db
    .insert(categoriesTable)
    .values({
      domainId,
      name,
      description: description ?? null,
    })
    .returning();
  return mapCategory(inserted);
}

export async function updateCategory(
  id: number,
  name: string,
  description: string | null,
): Promise<void> {
  await db
    .update(categoriesTable)
    .set({
      name,
      description: description ?? null,
    })
    .where(eq(categoriesTable.id, id));
}

export async function deleteCategory(id: number): Promise<void> {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
}

export async function getFlashcardsByCategory(
  categoryId: number,
): Promise<Flashcard[]> {
  const rows = await db
    .select()
    .from(flashcardsTable)
    .where(eq(flashcardsTable.categoryId, categoryId))
    .orderBy(desc(flashcardsTable.createdAt));
  return rows.map(mapFlashcard);
}

export async function getFlashcardById(
  id: number,
): Promise<Flashcard | undefined> {
  const [row] = await db
    .select()
    .from(flashcardsTable)
    .where(eq(flashcardsTable.id, id))
    .limit(1);
  return row ? mapFlashcard(row) : undefined;
}

export async function createFlashcard(
  categoryId: number,
  question: string,
  answer: string,
  difficulty: DifficultyLevelType = "medium",
): Promise<Flashcard> {
  const [inserted] = await db
    .insert(flashcardsTable)
    .values({
      categoryId,
      question,
      answer,
      difficulty,
    })
    .returning();
  return mapFlashcard(inserted);
}

export async function updateFlashcard(
  id: number,
  question: string,
  answer: string,
  difficulty: DifficultyLevelType,
): Promise<void> {
  await db
    .update(flashcardsTable)
    .set({
      question,
      answer,
      difficulty,
    })
    .where(eq(flashcardsTable.id, id));
}

export async function deleteFlashcard(id: number): Promise<void> {
  await db.delete(flashcardsTable).where(eq(flashcardsTable.id, id));
}

// ============= Review History Operations =============
export async function getFlashcardReviewHistory(
  flashcardId: number,
): Promise<ReviewHistory[]> {
  const rows = await db
    .select()
    .from(reviewHistoryTable)
    .where(eq(reviewHistoryTable.flashcardId, flashcardId))
    .orderBy(desc(reviewHistoryTable.reviewDate));
  return rows.map(mapReviewHistory);
}

export async function getLastReview(
  flashcardId: number,
): Promise<ReviewHistory | undefined> {
  const [row] = await db
    .select()
    .from(reviewHistoryTable)
    .where(eq(reviewHistoryTable.flashcardId, flashcardId))
    .orderBy(desc(reviewHistoryTable.reviewDate))
    .limit(1);
  return row ? mapReviewHistory(row) : undefined;
}

/**
 * Legacy helper kept for backward compatibility.
 * NOTE: The new review system uses domain-driven repositories with user-aware history.
 * This function currently throws to avoid writing inconsistent data into the new schema.
 */
export async function createReviewRecord(): Promise<never> {
  throw new Error(
    "createReviewRecord from db-operations is deprecated. Use the new review repositories instead.",
  );
}

// ============= Struggling Queue Operations =============
export async function getStrugglingCards(): Promise<StrugglingCard[]> {
  const rows = await db
    .select()
    .from(strugglingQueueTable)
    .orderBy(
      desc(strugglingQueueTable.timesFailed),
      desc(strugglingQueueTable.lastFailedAt),
    );
  return rows.map(mapStrugglingCard);
}

export async function addToStrugglingQueue(flashcardId: number): Promise<void> {
  const [existing] = await db
    .select()
    .from(strugglingQueueTable)
    .where(eq(strugglingQueueTable.flashcardId, flashcardId))
    .limit(1);

  if (existing) {
    await db
      .update(strugglingQueueTable)
      .set({
        timesFailed: sql`${strugglingQueueTable.timesFailed} + 1`,
        lastFailedAt: new Date(),
      })
      .where(eq(strugglingQueueTable.flashcardId, flashcardId));
  } else {
    await db.insert(strugglingQueueTable).values({
      flashcardId,
      // addedAt, timesFailed, lastFailedAt have defaults
    });
  }
}

export async function removeFromStrugglingQueue(
  flashcardId: number,
): Promise<void> {
  await db
    .delete(strugglingQueueTable)
    .where(eq(strugglingQueueTable.flashcardId, flashcardId));
}

export async function isCardStruggling(flashcardId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: strugglingQueueTable.id })
    .from(strugglingQueueTable)
    .where(eq(strugglingQueueTable.flashcardId, flashcardId))
    .limit(1);
  return !!row;
}

// ============= Review Session Operations (Legacy, global) =============
export async function getDueFlashcards(limit?: number): Promise<Flashcard[]> {
  // This is a legacy, user-agnostic implementation used only for aggregated stats.
  // It finds the latest review record (by date) for each flashcard and checks if its
  // nextReviewDate is in the past or today. Flashcards without any reviews are treated as due.

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get only the latest review record per flashcard using a NOT EXISTS correlated subquery
  const latestWithDetails = await db
    .select({
      flashcardId: reviewHistoryTable.flashcardId,
      nextReviewDate: reviewHistoryTable.nextReviewDate,
    })
    .from(reviewHistoryTable)
    .where(
      sql`NOT EXISTS (
        SELECT 1
        FROM "review_history" rh2
        WHERE rh2."flashcard_id" = "review_history"."flashcard_id"
          AND rh2."review_date" > "review_history"."review_date"
      )`,
    );

  const dueIds = new Set<number>();
  for (const row of latestWithDetails) {
    const next = new Date(row.nextReviewDate);
    next.setHours(0, 0, 0, 0);
    if (next <= today) {
      dueIds.add(row.flashcardId);
    }
  }

  // Track which flashcards have any review history
  const cardsWithHistoryRows = await db
    .select({
      flashcardId: reviewHistoryTable.flashcardId,
    })
    .from(reviewHistoryTable)
    .groupBy(reviewHistoryTable.flashcardId);

  const cardsWithHistory = new Set<number>(
    cardsWithHistoryRows.map((row) => row.flashcardId),
  );

  // Include flashcards with no history as due
  const allCards = await db
    .select()
    .from(flashcardsTable)
    .orderBy(asc(flashcardsTable.createdAt));
  const dueCards = allCards.filter(
    (card) => dueIds.has(card.id) || !cardsWithHistory.has(card.id),
  );

  const sliced =
    typeof limit === "number" ? dueCards.slice(0, limit) : dueCards;
  return sliced.map(mapFlashcard);
}

export async function getTodayReviewCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [row] = await db
    .select({
      count: sql<number>`COUNT(*)`.as("count"),
    })
    .from(reviewHistoryTable)
    .where(
      and(
        gte(reviewHistoryTable.reviewDate, today),
        lt(reviewHistoryTable.reviewDate, tomorrow),
      ),
    );

  return row?.count ?? 0;
}

export async function getCurrentStreak(): Promise<number> {
  // Get distinct review dates (by day) in descending order
  const rows = await db
    .select({
      reviewDay: sql<string>`DATE(${reviewHistoryTable.reviewDate})`,
    })
    .from(reviewHistoryTable)
    .groupBy(sql`DATE(${reviewHistoryTable.reviewDate})`)
    .orderBy(desc(sql`DATE(${reviewHistoryTable.reviewDate})`));

  if (rows.length === 0) {
    return 0;
  }

  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const row of rows) {
    const reviewDate = new Date(row.reviewDay);
    reviewDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}
