import { and, count, desc, eq, sql } from "drizzle-orm";
import { Hearts } from "@/domains/gamification/value-objects/Hearts";
import { XP } from "@/domains/gamification/value-objects/XP";
import { LessonCompletion } from "@/domains/learning-path/entities/LessonCompletion";
import type { ILessonCompletionRepository } from "@/domains/learning-path/repositories/ILessonCompletionRepository";
import { Accuracy } from "@/domains/learning-path/value-objects/Accuracy";
import { DomainError } from "@/domains/shared/errors";
import {
  LessonCompletionId,
  LessonId,
  UserId,
} from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import { lessonCompletions } from "@/infrastructure/database/schema/learning-path.schema";

/**
 * Drizzle/PostgreSQL implementation of LessonCompletion repository
 */
export class SqliteLessonCompletionRepository
  implements ILessonCompletionRepository
{
  constructor(private readonly db: DbClient) {}

  async findById(id: LessonCompletionId): Promise<LessonCompletion | null> {
    const rows = await this.db
      .select()
      .from(lessonCompletions)
      .where(eq(lessonCompletions.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToEntity(row);
  }

  async findByUserId(userId: UserId): Promise<LessonCompletion[]> {
    const rows = await this.db
      .select()
      .from(lessonCompletions)
      .where(eq(lessonCompletions.userId, userId as string))
      .orderBy(desc(lessonCompletions.completedAt));

    return rows.map((row) => this.mapToEntity(row));
  }

  async findByLessonId(lessonId: LessonId): Promise<LessonCompletion[]> {
    const rows = await this.db
      .select()
      .from(lessonCompletions)
      .where(eq(lessonCompletions.lessonId, lessonId as number))
      .orderBy(desc(lessonCompletions.completedAt));

    return rows.map((row) => this.mapToEntity(row));
  }

  async findByUserAndLesson(
    userId: UserId,
    lessonId: LessonId,
  ): Promise<LessonCompletion[]> {
    const rows = await this.db
      .select()
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, userId as string),
          eq(lessonCompletions.lessonId, lessonId as number),
        ),
      )
      .orderBy(desc(lessonCompletions.completedAt));

    return rows.map((row) => this.mapToEntity(row));
  }

  async findBestCompletion(
    userId: UserId,
    lessonId: LessonId,
  ): Promise<LessonCompletion | null> {
    const rows = await this.db
      .select()
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, userId as string),
          eq(lessonCompletions.lessonId, lessonId as number),
        ),
      )
      .orderBy(
        desc(lessonCompletions.accuracyPercent),
        desc(lessonCompletions.xpEarned),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToEntity(row);
  }

  async findRecentByUser(
    userId: UserId,
    limit: number,
  ): Promise<LessonCompletion[]> {
    const rows = await this.db
      .select()
      .from(lessonCompletions)
      .where(eq(lessonCompletions.userId, userId as string))
      .orderBy(desc(lessonCompletions.completedAt))
      .limit(limit);

    return rows.map((row) => this.mapToEntity(row));
  }

  async countCompletions(userId: UserId, lessonId: LessonId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, userId as string),
          eq(lessonCompletions.lessonId, lessonId as number),
        ),
      );

    return Number(row?.count ?? 0);
  }

  async save(completion: LessonCompletion): Promise<LessonCompletion> {
    if (completion.isNew()) {
      // Insert new completion
      const [inserted] = await this.db
        .insert(lessonCompletions)
        .values({
          userId: completion.getUserId() as string,
          lessonId: completion.getLessonId() as number,
          completedAt: completion.getCompletedAt(),
          xpEarned: completion.getXPEarned().getAmount(),
          accuracyPercent: completion.getAccuracy().getPercent(),
          timeSpentSeconds: completion.getTimeSpentSeconds(),
          heartsRemaining: completion.getHeartsRemaining().remaining(),
        })
        .returning();

      return this.mapToEntity(inserted);
    } else {
      // Lesson completions are immutable - they shouldn't be updated
      // If you need to update, delete and create a new one
      throw new DomainError(
        "Lesson completions are immutable",
        "COMPLETION_IMMUTABLE",
      );
    }
  }

  async delete(id: LessonCompletionId): Promise<void> {
    const result = await this.db
      .delete(lessonCompletions)
      .where(eq(lessonCompletions.id, id as number));

    if ((result.rowCount ?? 0) === 0) {
      throw new DomainError(
        "Lesson completion not found",
        "COMPLETION_NOT_FOUND",
      );
    }
  }

  async calculateAverageAccuracy(userId: UserId): Promise<number> {
    const [row] = await this.db
      .select({
        avg: sql<number | null>`AVG(${lessonCompletions.accuracyPercent})`,
      })
      .from(lessonCompletions)
      .where(eq(lessonCompletions.userId, userId as string));

    return row?.avg ?? 0;
  }

  async getTotalXPEarned(userId: UserId): Promise<number> {
    const [row] = await this.db
      .select({ total: sql<number | null>`SUM(${lessonCompletions.xpEarned})` })
      .from(lessonCompletions)
      .where(eq(lessonCompletions.userId, userId as string));

    return row?.total ?? 0;
  }

  async hasCompleted(userId: UserId, lessonId: LessonId): Promise<boolean> {
    const rows = await this.db
      .select({ id: lessonCompletions.id })
      .from(lessonCompletions)
      .where(
        and(
          eq(lessonCompletions.userId, userId as string),
          eq(lessonCompletions.lessonId, lessonId as number),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  /**
   * Map database row to domain entity
   */
  private mapToEntity(row: {
    id: number;
    userId: string;
    lessonId: number;
    completedAt: Date;
    xpEarned: number;
    accuracyPercent: number;
    timeSpentSeconds: number | null;
    heartsRemaining: number;
  }): LessonCompletion {
    return LessonCompletion.reconstitute(
      LessonCompletionId(row.id),
      UserId(row.userId),
      LessonId(row.lessonId),
      row.completedAt,
      XP.fromAmount(row.xpEarned),
      Accuracy.fromPercent(row.accuracyPercent),
      row.timeSpentSeconds ?? 0,
      Hearts.create(row.heartsRemaining),
      row.accuracyPercent === 100, // isPerfect
    );
  }
}
