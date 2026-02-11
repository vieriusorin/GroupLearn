/**
 * Database implementation of AI Generated Content Repository
 *
 * Handles persistence and retrieval of AI-generated flashcard content.
 */

import { and, desc, eq } from "drizzle-orm";
import type { IAIGeneratedContentRepository } from "@/domains/ai/repositories/IAIGeneratedContentRepository";
import {
  AIGeneratedContent,
  type AIGeneratedContentProps,
  type FlashcardDraft,
} from "@/domains/ai/entities/AIGeneratedContent";
import { db } from "@/infrastructure/database/drizzle";
import {
  aiGeneratedContent,
  type NewAIGeneratedContent,
} from "@/infrastructure/database/schema/ai.schema";

export class DatabaseAIGeneratedContentRepository
  implements IAIGeneratedContentRepository
{
  /**
   * Create a new AI generated content record
   */
  async create(content: AIGeneratedContent): Promise<AIGeneratedContent> {
    const props = content.toObject();

    const newContent: NewAIGeneratedContent = {
      sourceType: props.sourceType,
      sourceUrl: props.sourceUrl ?? null,
      sourceFileName: undefined, // Not in entity, can be added if needed
      extractedText: props.extractedText ?? null,
      generatedCards: props.generatedCards as any,
      status: props.status,
      userId: props.userId,
      modelUsed: props.modelUsed ?? null,
      tokensUsed: props.tokensUsed ?? null,
      estimatedCost: props.estimatedCost?.toString() ?? null,
      errorMessage: props.errorMessage ?? null,
      approvedCount: props.approvedCount,
      rejectedCount: props.rejectedCount,
      completedAt: props.completedAt ?? null,
    };

    const [inserted] = await db
      .insert(aiGeneratedContent)
      .values(newContent)
      .returning();

    return this.toDomainEntity(inserted);
  }

  /**
   * Update an existing AI generated content record
   */
  async update(content: AIGeneratedContent): Promise<AIGeneratedContent> {
    const props = content.toObject();

    if (!props.id) {
      throw new Error("Cannot update content without an ID");
    }

    const [updated] = await db
      .update(aiGeneratedContent)
      .set({
        status: props.status,
        generatedCards: props.generatedCards as any,
        modelUsed: props.modelUsed ?? null,
        tokensUsed: props.tokensUsed ?? null,
        estimatedCost: props.estimatedCost?.toString() ?? null,
        errorMessage: props.errorMessage ?? null,
        approvedCount: props.approvedCount,
        rejectedCount: props.rejectedCount,
        completedAt: props.completedAt ?? null,
      })
      .where(eq(aiGeneratedContent.id, props.id))
      .returning();

    if (!updated) {
      throw new Error(`AI generated content with ID ${props.id} not found`);
    }

    return this.toDomainEntity(updated);
  }

  /**
   * Find AI generated content by ID
   */
  async findById(id: number): Promise<AIGeneratedContent | null> {
    const [content] = await db
      .select()
      .from(aiGeneratedContent)
      .where(eq(aiGeneratedContent.id, id))
      .limit(1);

    return content ? this.toDomainEntity(content) : null;
  }

  /**
   * Find all AI generated content for a user
   */
  async findByUserId(
    userId: string,
    options?: {
      status?: "pending" | "processing" | "completed" | "failed";
      sourceType?: "pdf" | "url" | "text" | "audio";
      limit?: number;
      offset?: number;
    },
  ): Promise<AIGeneratedContent[]> {
    const conditions = [eq(aiGeneratedContent.userId, userId)];

    if (options?.status) {
      conditions.push(eq(aiGeneratedContent.status, options.status));
    }

    if (options?.sourceType) {
      conditions.push(eq(aiGeneratedContent.sourceType, options.sourceType));
    }

    let query = db
      .select()
      .from(aiGeneratedContent)
      .where(and(...conditions))
      .orderBy(desc(aiGeneratedContent.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query;

    return results.map((content) => this.toDomainEntity(content));
  }

  /**
   * Find pending content for a user (not yet reviewed)
   */
  async findPendingForUser(userId: string): Promise<AIGeneratedContent[]> {
    return this.findByUserId(userId, { status: "pending" });
  }

  /**
   * Delete AI generated content by ID
   */
  async delete(id: number): Promise<void> {
    await db.delete(aiGeneratedContent).where(eq(aiGeneratedContent.id, id));
  }

  /**
   * Convert database record to domain entity
   */
  private toDomainEntity(
    record: typeof aiGeneratedContent.$inferSelect,
  ): AIGeneratedContent {
    const props: AIGeneratedContentProps = {
      id: record.id,
      sourceType: record.sourceType as "pdf" | "url" | "text" | "audio",
      sourceUrl: record.sourceUrl ?? undefined,
      sourceContent: undefined, // Not stored in DB, only used during processing
      extractedText: record.extractedText ?? undefined,
      generatedCards: (record.generatedCards as FlashcardDraft[]) ?? [],
      status: record.status as "pending" | "processing" | "completed" | "failed",
      userId: record.userId,
      modelUsed: record.modelUsed ?? undefined,
      tokensUsed: record.tokensUsed ?? undefined,
      estimatedCost: record.estimatedCost
        ? parseFloat(record.estimatedCost)
        : undefined,
      errorMessage: record.errorMessage ?? undefined,
      approvedCount: record.approvedCount,
      rejectedCount: record.rejectedCount,
      createdAt: record.createdAt,
      completedAt: record.completedAt ?? undefined,
    };

    return new AIGeneratedContent(props);
  }
}
