/**
 * Content Generation Service
 *
 * Provides AI-powered content generation features including:
 * - Flashcard generation from text
 * - PDF text extraction and flashcard generation
 * - URL content scraping and flashcard generation
 * - Batch processing support via Trigger.dev
 */

import { AIService } from "@/lib/ai/ai-sdk";
import {
  buildFlashcardGenerationPrompt,
  buildTextExtractionPrompt,
  parseJSONResponse,
  validateFlashcard,
} from "@/lib/ai/prompts";
import {
  AIGeneratedContent,
  type AIGeneratedContentProps,
  type FlashcardDraft,
} from "../entities/AIGeneratedContent";
import { db } from "@/infrastructure/database/db";
import { aiGeneratedContent } from "@/infrastructure/database/schema/ai.schema";

export interface GenerateFromTextOptions {
  userId: string;
  sourceText: string;
  cardCount?: number;
  sourceType?: "text" | "url" | "pdf";
  sourceUrl?: string;
}

export interface GenerateFromPDFOptions {
  userId: string;
  pdfUrl: string;
  cardCount?: number;
}

export class ContentGenerationService {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate flashcards from plain text
   *
   * This is the core generation method used by other methods.
   */
  async generateFromText(options: GenerateFromTextOptions): Promise<AIGeneratedContent> {
    const { userId, sourceText, cardCount = 10, sourceType = "text", sourceUrl } = options;

    // Create initial record
    const content = new AIGeneratedContent({
      sourceType,
      sourceUrl,
      sourceContent: sourceType === "text" ? sourceText : undefined,
      extractedText: sourceType !== "text" ? sourceText : undefined,
      generatedCards: [],
      status: "pending",
      userId,
      approvedCount: 0,
      rejectedCount: 0,
      createdAt: new Date(),
    });

    // Persist to database
    const [created] = await db
      .insert(aiGeneratedContent)
      .values({
        sourceType: content.sourceType,
        sourceUrl: content.sourceUrl,
        sourceContent: content.sourceContent,
        extractedText: content.extractedText,
        generatedCards: [],
        status: content.status,
        userId: content.userId,
        approvedCount: content.approvedCount,
        rejectedCount: content.rejectedCount,
      })
      .returning();

    // Update with ID
    const persistedContent = new AIGeneratedContent({
      ...content.toObject(),
      id: created.id,
    });

    // Mark as processing
    const processing = persistedContent.markAsProcessing();
    await db
      .update(aiGeneratedContent)
      .set({ status: "processing" })
      .where(eq(aiGeneratedContent.id, created.id));

    try {
      // Generate flashcards using AI
      const prompt = buildFlashcardGenerationPrompt(sourceText, cardCount);
      const response = await this.aiService.generate(prompt, {
        userId,
        modelTier: "balanced", // Use Sonnet for flashcard generation
        taskType: "flashcard_generation",
      });

      // Parse and validate response
      let cards = parseJSONResponse<FlashcardDraft[]>(response);

      // Validate each card
      cards = cards
        .map((card) => validateFlashcard(card))
        .filter((card): card is FlashcardDraft => card !== null);

      // Mark as completed
      const completed = processing.markAsCompleted(
        cards,
        "claude-sonnet-4-5-20250929",
        0, // Tokens tracked separately
        0 // Cost tracked separately
      );

      // Update database
      await db
        .update(aiGeneratedContent)
        .set({
          status: "completed",
          generatedCards: cards,
          modelUsed: completed.modelUsed,
          tokensUsed: completed.tokensUsed,
          estimatedCost: completed.estimatedCost?.toString(),
          completedAt: completed.completedAt,
        })
        .where(eq(aiGeneratedContent.id, created.id));

      return completed;
    } catch (error) {
      // Mark as failed
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const failed = processing.markAsFailed(errorMessage);

      await db
        .update(aiGeneratedContent)
        .set({
          status: "failed",
          errorMessage: failed.errorMessage,
          completedAt: failed.completedAt,
        })
        .where(eq(aiGeneratedContent.id, created.id));

      throw error;
    }
  }

  /**
   * Generate flashcards from a PDF file
   *
   * First extracts text from the PDF, then generates flashcards.
   * This should be run as a Trigger.dev task for large PDFs.
   */
  async generateFromPDF(options: GenerateFromPDFOptions): Promise<AIGeneratedContent> {
    const { userId, pdfUrl, cardCount = 10 } = options;

    // For now, this is a placeholder
    // In production, this would:
    // 1. Download PDF from URL
    // 2. Extract text using pdf-parse
    // 3. Chunk text if too large
    // 4. Generate flashcards from each chunk
    // 5. Combine results

    throw new Error("PDF generation not yet implemented - requires Trigger.dev task");
  }

  /**
   * Generate flashcards from a URL
   *
   * Scrapes the URL content, cleans it, and generates flashcards.
   * This should be run as a Trigger.dev task to avoid blocking.
   */
  async generateFromURL(
    userId: string,
    url: string,
    cardCount: number = 10
  ): Promise<AIGeneratedContent> {
    // For now, this is a placeholder
    // In production, this would:
    // 1. Fetch URL content
    // 2. Extract main content (remove nav, ads, etc.) using AI
    // 3. Generate flashcards from extracted text

    throw new Error("URL generation not yet implemented - requires Trigger.dev task");
  }

  /**
   * Extract main content from HTML using AI
   *
   * Removes navigation, ads, footers, etc. and returns clean text.
   */
  async extractContentFromHTML(html: string, userId: string): Promise<string> {
    const prompt = buildTextExtractionPrompt(html);

    const extractedText = await this.aiService.generate(prompt, {
      userId,
      modelTier: "fast", // Use Haiku for extraction
      taskType: "socratic_hint", // Reuse hint quota
    });

    return extractedText;
  }

  /**
   * Update approval counts for AI-generated content
   *
   * Called when user reviews generated flashcards.
   */
  async updateApprovalCounts(
    contentId: number,
    approvedCount: number,
    rejectedCount: number
  ): Promise<void> {
    await db
      .update(aiGeneratedContent)
      .set({
        approvedCount,
        rejectedCount,
      })
      .where(eq(aiGeneratedContent.id, contentId));
  }

  /**
   * Get pending AI-generated content for a user
   *
   * Returns content that has been generated but not yet fully reviewed.
   */
  async getPendingContentForUser(userId: string): Promise<AIGeneratedContent[]> {
    const records = await db.query.aiGeneratedContent.findMany({
      where: and(
        eq(aiGeneratedContent.userId, userId),
        eq(aiGeneratedContent.status, "completed")
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    return records
      .map((record) => {
        return new AIGeneratedContent({
          id: record.id,
          sourceType: record.sourceType as "pdf" | "url" | "text" | "audio",
          sourceUrl: record.sourceUrl || undefined,
          sourceContent: record.sourceContent || undefined,
          extractedText: record.extractedText || undefined,
          generatedCards: (record.generatedCards as FlashcardDraft[]) || [],
          status: record.status as "pending" | "processing" | "completed" | "failed",
          userId: record.userId,
          modelUsed: record.modelUsed || undefined,
          tokensUsed: record.tokensUsed || undefined,
          estimatedCost: record.estimatedCost
            ? parseFloat(record.estimatedCost)
            : undefined,
          errorMessage: record.errorMessage || undefined,
          approvedCount: record.approvedCount || 0,
          rejectedCount: record.rejectedCount || 0,
          createdAt: record.createdAt,
          completedAt: record.completedAt || undefined,
        });
      })
      .filter((content) => !content.isFullyReviewed());
  }

  /**
   * Delete AI-generated content
   */
  async deleteContent(contentId: number): Promise<void> {
    await db.delete(aiGeneratedContent).where(eq(aiGeneratedContent.id, contentId));
  }
}
