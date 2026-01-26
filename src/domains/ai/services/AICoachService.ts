/**
 * AI Coach Service
 *
 * Provides AI-powered coaching features including:
 * - Socratic hints for flashcards
 * - Knowledge gap analysis for groups
 * - Bridge deck generation to address gaps
 */

import { AIService } from "@/lib/ai/ai-sdk";
import {
  buildSocraticHintPrompt,
  buildGapAnalysisPrompt,
  buildBridgeDeckPrompt,
  parseJSONResponse,
} from "@/lib/ai/prompts";
import { KnowledgeGap, type KnowledgeGapProps } from "../entities/KnowledgeGap";
import { FlashcardDraft } from "../entities/AIGeneratedContent";
import { db } from "@/infrastructure/database/db";
import { aiHints } from "@/infrastructure/database/schema/ai.schema";
import { reviewHistory, groupMembers } from "@/infrastructure/database/schema";
import { eq, and, lt, inArray } from "drizzle-orm";
import { addHours } from "date-fns";

export interface FlashcardForHint {
  id: number;
  question: string;
  answer: string;
  hints?: string;
}

export interface GroupWeaknessData {
  flashcardId: number;
  question: string;
  answer: string;
  category: string;
  failureCount: number;
  successCount: number;
  successRate: number;
  affectedUsers: string[];
}

export class AICoachService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate a Socratic hint for a flashcard
   *
   * First checks the cache, then generates if not found.
   * Deducts 2 XP from the user as a "help-seeking penalty".
   */
  async generateSocraticHint(
    flashcard: FlashcardForHint,
    userId: string
  ): Promise<{ hint: string; fromCache: boolean }> {
    // Check cache first
    const cached = await db.query.aiHints.findFirst({
      where: and(
        eq(aiHints.flashcardId, flashcard.id),
        eq(aiHints.expiresAt, new Date())
      ),
    });

    if (cached) {
      return { hint: cached.hint, fromCache: true };
    }

    // Generate new hint
    const prompt = buildSocraticHintPrompt(flashcard.question, flashcard.answer);
    const hint = await this.aiService.generate(prompt, {
      userId,
      modelTier: "fast", // Use fast model (Haiku) for hints
      taskType: "socratic_hint",
      cacheKey: `hint:${flashcard.id}`,
    });

    // Cache the hint for 24 hours
    await db.insert(aiHints).values({
      flashcardId: flashcard.id,
      hint,
      modelUsed: "claude-3-5-haiku-20241022",
      tokensUsed: 0, // Will be tracked separately
      expiresAt: addHours(new Date(), 24),
    });

    return { hint, fromCache: false };
  }

  /**
   * Analyze knowledge gaps for a group
   *
   * Identifies topics where the group is struggling (< 40% success rate)
   * and uses AI to determine prerequisite concepts that need reinforcement.
   */
  async analyzeGroupWeaknesses(groupId: number): Promise<KnowledgeGap[]> {
    // Get all members of the group
    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      columns: { userId: true },
    });

    const userIds = members.map((m) => m.userId);

    if (userIds.length === 0) {
      return [];
    }

    // Aggregate review data to find weaknesses
    // This is a complex query that groups by flashcard and calculates success rates
    const weaknesses = await db
      .select({
        flashcardId: reviewHistory.flashcardId,
        failureCount: db
          .count()
          .where(and(eq(reviewHistory.isCorrect, false)))
          .$type<number>(),
        successCount: db
          .count()
          .where(and(eq(reviewHistory.isCorrect, true)))
          .$type<number>(),
      })
      .from(reviewHistory)
      .where(inArray(reviewHistory.userId, userIds))
      .groupBy(reviewHistory.flashcardId);

    // Filter for flashcards with < 40% success rate
    const strugglingFlashcards = weaknesses
      .map((w) => ({
        flashcardId: w.flashcardId,
        successRate:
          w.successCount + w.failureCount === 0
            ? 0
            : (w.successCount / (w.successCount + w.failureCount)) * 100,
        failureCount: w.failureCount,
      }))
      .filter((w) => w.successRate < 40 && w.failureCount >= 3); // At least 3 failures

    if (strugglingFlashcards.length === 0) {
      return [];
    }

    // Get full flashcard details
    const flashcardIds = strugglingFlashcards.map((w) => w.flashcardId);
    const flashcards = await db.query.flashcards.findMany({
      where: inArray(db.schema.flashcards.id, flashcardIds),
      with: {
        category: {
          columns: { name: true },
        },
      },
    });

    // Build prompt for AI analysis
    const weaknessData: GroupWeaknessData[] = flashcards.map((fc) => {
      const weakness = strugglingFlashcards.find((w) => w.flashcardId === fc.id)!;
      return {
        flashcardId: fc.id,
        question: fc.question,
        answer: fc.answer,
        category: fc.category?.name || "Unknown",
        failureCount: weakness.failureCount,
        successCount: 0, // Can be calculated from total - failure
        successRate: weakness.successRate,
        affectedUsers: [], // Could be populated if needed
      };
    });

    const prompt = buildGapAnalysisPrompt(weaknessData);

    // Use a premium user's quota for group analysis (e.g., group admin)
    // In production, this would need proper quota management
    const response = await this.aiService.generate(prompt, {
      userId: "system", // System user for group operations
      modelTier: "balanced", // Use balanced model (Sonnet) for analysis
      taskType: "gap_analysis",
    });

    // Parse AI response
    const gapData = parseJSONResponse<KnowledgeGapProps[]>(response);

    // Convert to KnowledgeGap entities
    const gaps = gapData.map((data) => {
      const severity = KnowledgeGap.calculateSeverity(
        data.successRate,
        data.affectedUserCount,
        userIds.length
      );

      return new KnowledgeGap({
        ...data,
        groupId,
        severity,
        status: "detected",
        bridgeDeckGenerated: false,
        detectedAt: new Date(),
      });
    });

    return gaps;
  }

  /**
   * Generate a "bridge deck" of flashcards to address a knowledge gap
   *
   * Creates 5-10 prerequisite flashcards that build up to the target concept.
   */
  async generateBridgeDeck(
    gap: KnowledgeGap,
    userId: string
  ): Promise<FlashcardDraft[]> {
    const prompt = buildBridgeDeckPrompt(
      gap.topic,
      gap.prerequisiteConcepts,
      gap.recommendedActions
    );

    const response = await this.aiService.generate(prompt, {
      userId,
      modelTier: "powerful", // Use powerful model (Opus) for complex generation
      taskType: "bridge_deck",
    });

    // Parse and validate flashcard drafts
    const cards = parseJSONResponse<FlashcardDraft[]>(response);

    return cards;
  }

  /**
   * Validate if a user's answer demonstrates understanding
   *
   * Used for text-based recall validation (not peer review).
   * Returns a score (0-100) and feedback.
   */
  async validateRecallAnswer(
    question: string,
    correctAnswer: string,
    userAnswer: string,
    userId: string
  ): Promise<{ score: number; feedback: string; isCorrect: boolean }> {
    const prompt = `
You are an expert tutor evaluating a student's answer to a flashcard question.

QUESTION: ${question}

CORRECT ANSWER: ${correctAnswer}

STUDENT'S ANSWER: ${userAnswer}

TASK: Evaluate the student's answer and provide:
1. A score from 0-100 based on correctness and understanding
2. Brief feedback (2-3 sentences max)
3. Whether the answer should be marked as correct (score >= 70)

Return your response as JSON:
{
  "score": 85,
  "feedback": "Your feedback here",
  "isCorrect": true
}
`.trim();

    const response = await this.aiService.generate(prompt, {
      userId,
      modelTier: "fast",
      taskType: "socratic_hint", // Reuse hint quota for this
    });

    const result = parseJSONResponse<{
      score: number;
      feedback: string;
      isCorrect: boolean;
    }>(response);

    return result;
  }
}
