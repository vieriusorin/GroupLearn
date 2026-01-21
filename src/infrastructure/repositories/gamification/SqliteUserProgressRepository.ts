import { and, count, desc, eq, gt, gte, lt, sql } from "drizzle-orm";
import { UserProgress } from "@/domains/gamification/aggregates/UserProgress";
import type { IUserProgressRepository } from "@/domains/gamification/repositories/IUserProgressRepository";
import { DomainError } from "@/domains/shared/errors";
import {
  GroupId,
  LessonId,
  PathId,
  UnitId,
  UserId,
  UserProgressId,
} from "@/domains/shared/types/branded-types";
import type { DbClient } from "@/infrastructure/database/drizzle";
import { userProgress } from "@/infrastructure/database/schema/gamification.schema";

/**
 * Drizzle/PostgreSQL implementation of UserProgress repository
 */
export class SqliteUserProgressRepository implements IUserProgressRepository {
  constructor(private readonly db: DbClient) {}

  async findById(id: UserProgressId): Promise<UserProgress | null> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.id, id as number))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToAggregate(row);
  }

  async findByUserAndPath(
    userId: UserId,
    pathId: PathId,
  ): Promise<UserProgress | null> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId as string),
          eq(userProgress.pathId, pathId as number),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapToAggregate(row);
  }

  async findByUserId(userId: UserId): Promise<UserProgress[]> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId as string))
      .orderBy(desc(userProgress.createdAt));

    return rows.map((row) => this.mapToAggregate(row));
  }

  async findByPathId(pathId: PathId): Promise<UserProgress[]> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.pathId, pathId as number))
      .orderBy(desc(userProgress.totalXp));

    return rows.map((row) => this.mapToAggregate(row));
  }

  async findByGroupId(groupId: GroupId): Promise<UserProgress[]> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.groupId, groupId as number))
      .orderBy(desc(userProgress.totalXp));

    return rows.map((row) => this.mapToAggregate(row));
  }

  async findByGroupAndPath(
    groupId: GroupId,
    pathId: PathId,
  ): Promise<UserProgress[]> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.groupId, groupId as number),
          eq(userProgress.pathId, pathId as number),
        ),
      )
      .orderBy(desc(userProgress.totalXp));

    return rows.map((row) => this.mapToAggregate(row));
  }

  async getLeaderboard(pathId: PathId, limit: number): Promise<UserProgress[]> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.pathId, pathId as number))
      .orderBy(desc(userProgress.totalXp))
      .limit(limit);

    return rows.map((row) => this.mapToAggregate(row));
  }

  async getGroupLeaderboard(
    groupId: GroupId,
    pathId: PathId,
    limit: number,
  ): Promise<UserProgress[]> {
    const rows = await this.db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.groupId, groupId as number),
          eq(userProgress.pathId, pathId as number),
        ),
      )
      .orderBy(desc(userProgress.totalXp))
      .limit(limit);

    return rows.map((row) => this.mapToAggregate(row));
  }

  async getUserRank(userId: UserId, pathId: PathId): Promise<number | null> {
    // Get user's XP for this path
    const userRows = await this.db
      .select({ totalXp: userProgress.totalXp })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId as string),
          eq(userProgress.pathId, pathId as number),
        ),
      )
      .limit(1);

    const userRow = userRows[0];
    if (!userRow) return null;

    // Count users with more XP
    const [rankRow] = await this.db
      .select({ rank: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.pathId, pathId as number),
          gt(userProgress.totalXp, userRow.totalXp),
        ),
      );

    const higherCount = Number(rankRow?.rank ?? 0);
    return higherCount + 1;
  }

  async findActiveStreaks(
    pathId?: PathId,
    minStreak: number = 1,
  ): Promise<UserProgress[]> {
    const conditions = [gte(userProgress.streakCount, minStreak)];

    if (pathId) {
      conditions.push(eq(userProgress.pathId, pathId as number));
    }

    const rows = await this.db
      .select()
      .from(userProgress)
      .where(and(...conditions))
      .orderBy(desc(userProgress.streakCount));

    return rows.map((row) => this.mapToAggregate(row));
  }

  async findEligibleForHeartRefill(): Promise<UserProgress[]> {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

    const rows = await this.db
      .select()
      .from(userProgress)
      .where(
        and(
          lt(userProgress.hearts, 5),
          lt(userProgress.lastHeartRefill, fourHoursAgo),
        ),
      )
      .orderBy(userProgress.lastHeartRefill);

    return rows.map((row) => this.mapToAggregate(row));
  }

  async save(progress: UserProgress): Promise<UserProgress> {
    if (progress.isNew()) {
      // Insert new progress
      const now = new Date();

      const [inserted] = await this.db
        .insert(userProgress)
        .values({
          userId: progress.getUserId() as string,
          pathId: progress.getPathId() as number,
          groupId: progress.getGroupId() as number | null,
          currentUnitId: progress.getCurrentUnitId() as number | null,
          currentLessonId: progress.getCurrentLessonId() as number | null,
          totalXp: progress.getXP().getAmount(),
          hearts: progress.getHearts().remaining(),
          lastHeartRefill: progress.getLastHeartRefill(),
          streakCount: progress.getStreak().getCount(),
          lastActivityDate: progress.getLastActivityDate(),
          startedAt: progress.getStartedAt(),
          completedAt: progress.getCompletedAt(),
          timeSpentTotal: progress.getTimeSpentTotal(),
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return this.mapToAggregate(inserted);
    } else {
      const now = new Date();

      await this.db
        .update(userProgress)
        .set({
          currentUnitId: progress.getCurrentUnitId() as number | null,
          currentLessonId: progress.getCurrentLessonId() as number | null,
          totalXp: progress.getXP().getAmount(),
          hearts: progress.getHearts().remaining(),
          lastHeartRefill: progress.getLastHeartRefill(),
          streakCount: progress.getStreak().getCount(),
          lastActivityDate: progress.getLastActivityDate(),
          completedAt: progress.getCompletedAt(),
          timeSpentTotal: progress.getTimeSpentTotal(),
          updatedAt: now,
        })
        .where(eq(userProgress.id, progress.getId() as number));

      return progress;
    }
  }

  async delete(id: UserProgressId): Promise<void> {
    const result = await this.db
      .delete(userProgress)
      .where(eq(userProgress.id, id as number));

    if ((result.rowCount ?? 0) === 0) {
      throw new DomainError("User progress not found", "PROGRESS_NOT_FOUND");
    }
  }

  async exists(userId: UserId, pathId: PathId): Promise<boolean> {
    const rows = await this.db
      .select({ id: userProgress.id })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId as string),
          eq(userProgress.pathId, pathId as number),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async countUsersOnPath(pathId: PathId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(userProgress)
      .where(eq(userProgress.pathId, pathId as number));

    return Number(row?.count ?? 0);
  }

  async countCompletedPath(pathId: PathId): Promise<number> {
    const [row] = await this.db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.pathId, pathId as number),
          sql`"completed_at" IS NOT NULL`,
        ),
      );

    return Number(row?.count ?? 0);
  }

  async getAverageXP(pathId: PathId): Promise<number> {
    const [row] = await this.db
      .select({ avg: sql<number>`AVG(${userProgress.totalXp})` })
      .from(userProgress)
      .where(eq(userProgress.pathId, pathId as number));

    return row?.avg ?? 0;
  }

  async getAverageCompletionTime(pathId: PathId): Promise<number | null> {
    const [row] = await this.db
      .select({ avg: sql<number | null>`AVG(${userProgress.timeSpentTotal})` })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.pathId, pathId as number),
          sql`"completed_at" IS NOT NULL`,
        ),
      );

    return row?.avg ?? null;
  }

  /**
   * Map database row to domain aggregate
   */
  private mapToAggregate(row: {
    id: number;
    userId: string;
    pathId: number;
    groupId: number | null;
    currentUnitId: number | null;
    currentLessonId: number | null;
    totalXp: number;
    hearts: number;
    lastHeartRefill: Date;
    streakCount: number;
    lastActivityDate: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    timeSpentTotal: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserProgress {
    const startedAt = row.startedAt ?? row.createdAt;

    return UserProgress.reconstitute(
      UserProgressId(row.id),
      UserId(row.userId),
      PathId(row.pathId),
      row.totalXp,
      row.hearts,
      row.streakCount,
      row.lastHeartRefill,
      row.lastActivityDate,
      row.currentUnitId ? (UnitId(row.currentUnitId) as UnitId) : null,
      row.currentLessonId ? (LessonId(row.currentLessonId) as LessonId) : null,
      row.groupId ? (GroupId(row.groupId) as GroupId) : null,
      startedAt,
      row.completedAt,
      row.timeSpentTotal ?? 0,
      row.createdAt,
      row.updatedAt,
    );
  }
}
