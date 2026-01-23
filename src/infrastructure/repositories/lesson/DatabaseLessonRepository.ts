import { asc, eq } from "drizzle-orm";
import { Flashcard } from "@/domains/content/entities/Flashcard";
import type {
  ILessonRepository,
  LessonData,
} from "@/domains/learning-path/repositories/ILessonRepository";
import {
  CategoryId,
  FlashcardId,
  type LessonId,
  type UnitId,
} from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import { flashcards } from "@/infrastructure/database/schema/content.schema";
import {
  lessonFlashcards,
  lessons,
} from "@/infrastructure/database/schema/learning-path.schema";

/**
 * Database implementation of Lesson repository
 */
export class DatabaseLessonRepository implements ILessonRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: LessonId): Promise<LessonData | null> {
    const rows = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToLessonData(row);
  }

  async findByUnit(unitId: UnitId): Promise<LessonData[]> {
    const rows = await this.db
      .select()
      .from(lessons)
      .where(eq(lessons.unitId, unitId as number))
      .orderBy(asc(lessons.orderIndex));

    return rows.map((row) => this.mapToLessonData(row));
  }

  async findFlashcardsForLesson(lessonId: LessonId): Promise<Flashcard[]> {
    const rows = await this.db
      .select({
        flashcard: flashcards,
        orderIndex: lessonFlashcards.orderIndex,
      })
      .from(lessonFlashcards)
      .innerJoin(flashcards, eq(lessonFlashcards.flashcardId, flashcards.id))
      .where(eq(lessonFlashcards.lessonId, lessonId as number))
      .orderBy(asc(lessonFlashcards.orderIndex));

    return rows.map((row) => this.mapToFlashcard(row.flashcard));
  }

  /**
   * Map database row to LessonData
   */
  private mapToLessonData(row: {
    id: number;
    unitId: number;
    name: string;
    description: string | null;
    orderIndex: number;
    xpReward: number;
    flashcardCount: number;
    createdAt: Date;
  }): LessonData {
    return {
      id: row.id,
      unitId: row.unitId,
      name: row.name,
      description: row.description,
      orderIndex: row.orderIndex,
      xpReward: row.xpReward,
      flashcardCount: row.flashcardCount,
      createdAt: row.createdAt,
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
