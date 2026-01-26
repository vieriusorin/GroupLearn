/**
 * Knowledge Gap Repository Interface
 *
 * Defines the contract for persisting and retrieving knowledge gap analysis.
 */

import { KnowledgeGap } from "../entities/KnowledgeGap";

export interface IKnowledgeGapRepository {
  /**
   * Create a new knowledge gap record
   */
  create(gap: KnowledgeGap): Promise<KnowledgeGap>;

  /**
   * Update an existing knowledge gap record
   */
  update(gap: KnowledgeGap): Promise<KnowledgeGap>;

  /**
   * Find knowledge gap by ID
   */
  findById(id: number): Promise<KnowledgeGap | null>;

  /**
   * Find all knowledge gaps for a group
   */
  findByGroupId(
    groupId: number,
    options?: {
      status?: "detected" | "addressed" | "resolved";
      severity?: "low" | "medium" | "high" | "critical";
      limit?: number;
    }
  ): Promise<KnowledgeGap[]>;

  /**
   * Find unaddressed gaps that need bridge decks
   */
  findUnaddressedGaps(groupId: number): Promise<KnowledgeGap[]>;

  /**
   * Find gaps by category
   */
  findByCategoryId(categoryId: number): Promise<KnowledgeGap[]>;

  /**
   * Delete knowledge gap by ID
   */
  delete(id: number): Promise<void>;
}
