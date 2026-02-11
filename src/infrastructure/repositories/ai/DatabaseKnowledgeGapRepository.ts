/**
 * Database implementation of Knowledge Gap Repository
 *
 * Handles persistence and retrieval of knowledge gap analysis data.
 */

import { and, desc, eq } from "drizzle-orm";
import type { IKnowledgeGapRepository } from "@/domains/ai/repositories/IKnowledgeGapRepository";
import {
  KnowledgeGap,
  type KnowledgeGapProps,
} from "@/domains/ai/entities/KnowledgeGap";
import { db } from "@/infrastructure/database/drizzle";
import {
  knowledgeGaps,
  type NewKnowledgeGap,
} from "@/infrastructure/database/schema/ai.schema";

export class DatabaseKnowledgeGapRepository
  implements IKnowledgeGapRepository
{
  /**
   * Create a new knowledge gap record
   */
  async create(gap: KnowledgeGap): Promise<KnowledgeGap> {
    const props = gap.toObject();

    // Convert entity status to database schema status
    const dbStatus =
      props.status === "detected"
        ? "active"
        : props.status === "addressed"
          ? "addressed"
          : "ignored"; // "resolved" maps to "ignored" for now

    const newGap: NewKnowledgeGap = {
      groupId: props.groupId,
      topic: props.topic,
      categoryId: props.categoryId ?? null,
      successRate: props.successRate,
      affectedUserCount: props.affectedUserCount,
      totalUsers: props.totalUsers ?? 0,
      prerequisiteConcepts: props.prerequisiteConcepts,
      recommendedActions: props.recommendedActions.map((action) => ({
        action: action,
        priority: "medium" as const,
        description: action,
      })),
      bridgeDeckGenerated: props.bridgeDeckGenerated,
      bridgeDeckId: null,
      severity: props.severity,
      status: dbStatus,
    };

    const [inserted] = await db
      .insert(knowledgeGaps)
      .values(newGap)
      .returning();

    return this.toDomainEntity(inserted);
  }

  /**
   * Update an existing knowledge gap record
   */
  async update(gap: KnowledgeGap): Promise<KnowledgeGap> {
    const props = gap.toObject();

    if (!props.id) {
      throw new Error("Cannot update knowledge gap without an ID");
    }

    // Convert entity status to database schema status
    const dbStatus =
      props.status === "detected"
        ? "active"
        : props.status === "addressed"
          ? "addressed"
          : "ignored";

    const [updated] = await db
      .update(knowledgeGaps)
      .set({
        topic: props.topic,
        successRate: props.successRate,
        affectedUserCount: props.affectedUserCount,
        totalUsers: props.totalUsers ?? 0,
        prerequisiteConcepts: props.prerequisiteConcepts,
        recommendedActions: props.recommendedActions.map((action) => ({
          action: action,
          priority: "medium" as const,
          description: action,
        })),
        bridgeDeckGenerated: props.bridgeDeckGenerated,
        severity: props.severity,
        status: dbStatus,
        addressedAt: props.status === "addressed" ? new Date() : undefined,
      })
      .where(eq(knowledgeGaps.id, props.id))
      .returning();

    if (!updated) {
      throw new Error(`Knowledge gap with ID ${props.id} not found`);
    }

    return this.toDomainEntity(updated);
  }

  /**
   * Find knowledge gap by ID
   */
  async findById(id: number): Promise<KnowledgeGap | null> {
    const [gap] = await db
      .select()
      .from(knowledgeGaps)
      .where(eq(knowledgeGaps.id, id))
      .limit(1);

    return gap ? this.toDomainEntity(gap) : null;
  }

  /**
   * Find all knowledge gaps for a group
   */
  async findByGroupId(
    groupId: number,
    options?: {
      status?: "detected" | "addressed" | "resolved";
      severity?: "low" | "medium" | "high" | "critical";
      limit?: number;
    },
  ): Promise<KnowledgeGap[]> {
    const conditions = [eq(knowledgeGaps.groupId, groupId)];

    if (options?.status) {
      // Convert entity status to database schema status
      const dbStatus =
        options.status === "detected"
          ? "active"
          : options.status === "addressed"
            ? "addressed"
            : "ignored";
      conditions.push(eq(knowledgeGaps.status, dbStatus));
    }

    if (options?.severity) {
      conditions.push(eq(knowledgeGaps.severity, options.severity));
    }

    let query = db
      .select()
      .from(knowledgeGaps)
      .where(and(...conditions))
      .orderBy(desc(knowledgeGaps.detectedAt));

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const results = await query;

    return results.map((gap) => this.toDomainEntity(gap));
  }

  /**
   * Find unaddressed gaps that need bridge decks
   */
  async findUnaddressedGaps(groupId: number): Promise<KnowledgeGap[]> {
    const gaps = await db
      .select()
      .from(knowledgeGaps)
      .where(
        and(
          eq(knowledgeGaps.groupId, groupId),
          eq(knowledgeGaps.status, "active"),
          eq(knowledgeGaps.bridgeDeckGenerated, false),
        ),
      )
      .orderBy(desc(knowledgeGaps.severity), desc(knowledgeGaps.detectedAt));

    return gaps.map((gap) => this.toDomainEntity(gap));
  }

  /**
   * Find gaps by category
   */
  async findByCategoryId(categoryId: number): Promise<KnowledgeGap[]> {
    const gaps = await db
      .select()
      .from(knowledgeGaps)
      .where(eq(knowledgeGaps.categoryId, categoryId))
      .orderBy(desc(knowledgeGaps.detectedAt));

    return gaps.map((gap) => this.toDomainEntity(gap));
  }

  /**
   * Delete knowledge gap by ID
   */
  async delete(id: number): Promise<void> {
    await db.delete(knowledgeGaps).where(eq(knowledgeGaps.id, id));
  }

  /**
   * Convert database record to domain entity
   */
  private toDomainEntity(
    record: typeof knowledgeGaps.$inferSelect,
  ): KnowledgeGap {
    // Convert database schema status to entity status
    const entityStatus =
      record.status === "active"
        ? ("detected" as const)
        : record.status === "addressed"
          ? ("addressed" as const)
          : ("resolved" as const);

    // Extract recommended actions from JSONB field
    const recommendedActions =
      record.recommendedActions?.map((action: any) => action.action as string) ??
      [];

    const props: KnowledgeGapProps = {
      id: record.id,
      groupId: record.groupId,
      topic: record.topic,
      categoryId: record.categoryId ?? undefined,
      successRate: record.successRate,
      affectedUserCount: record.affectedUserCount,
      totalUsers: record.totalUsers,
      prerequisiteConcepts: (record.prerequisiteConcepts as string[]) ?? [],
      recommendedActions: recommendedActions,
      severity: record.severity as "low" | "medium" | "high" | "critical",
      status: entityStatus,
      bridgeDeckGenerated: record.bridgeDeckGenerated,
      detectedAt: record.detectedAt,
    };

    return new KnowledgeGap(props);
  }
}
