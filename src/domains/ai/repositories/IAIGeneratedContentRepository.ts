/**
 * AI Generated Content Repository Interface
 *
 * Defines the contract for persisting and retrieving AI-generated content.
 */

import { AIGeneratedContent } from "../entities/AIGeneratedContent";

export interface IAIGeneratedContentRepository {
  /**
   * Create a new AI generated content record
   */
  create(content: AIGeneratedContent): Promise<AIGeneratedContent>;

  /**
   * Update an existing AI generated content record
   */
  update(content: AIGeneratedContent): Promise<AIGeneratedContent>;

  /**
   * Find AI generated content by ID
   */
  findById(id: number): Promise<AIGeneratedContent | null>;

  /**
   * Find all AI generated content for a user
   */
  findByUserId(
    userId: string,
    options?: {
      status?: "pending" | "processing" | "completed" | "failed";
      sourceType?: "pdf" | "url" | "text" | "audio";
      limit?: number;
      offset?: number;
    }
  ): Promise<AIGeneratedContent[]>;

  /**
   * Find pending content for a user (not yet reviewed)
   */
  findPendingForUser(userId: string): Promise<AIGeneratedContent[]>;

  /**
   * Delete AI generated content by ID
   */
  delete(id: number): Promise<void>;
}
