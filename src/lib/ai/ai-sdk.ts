/**
 * AI Wrapper SDK
 *
 * Intelligent AI service wrapper that optimizes costs through:
 * - Model selection based on task complexity
 * - Aggressive response caching
 * - Per-user usage limits
 * - Token tracking and cost estimation
 */

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'node:crypto';
import { db } from '@/infrastructure/database/db';
import {
  aiResponseCache,
  aiUsageTracking,
  aiUsageQuotas,
  type NewAIUsageTracking,
  type NewAIResponseCache,
} from '@/infrastructure/database/schema/ai.schema';
import { eq, and, gte, lt, sql } from 'drizzle-orm';
import { ServerConfig, requireFeature } from '@/lib/shared/feature-flags';

// ============================================
// Model Configuration
// ============================================

export enum AIModelTier {
  FAST = 'fast', // Haiku - Simple tasks, low cost
  BALANCED = 'balanced', // Sonnet - Most tasks, good balance
  POWERFUL = 'powerful', // Opus - Complex analysis only
}

interface ModelConfig {
  model: string;
  maxTokens: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

const MODEL_CONFIG: Record<AIModelTier, ModelConfig> = {
  [AIModelTier.FAST]: {
    model: 'claude-3-5-haiku-20241022',
    maxTokens: 1024,
    costPer1kInputTokens: 0.0008,
    costPer1kOutputTokens: 0.004,
  },
  [AIModelTier.BALANCED]: {
    model: 'claude-sonnet-4-5-20250929',
    maxTokens: 2048,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
  },
  [AIModelTier.POWERFUL]: {
    model: 'claude-opus-4-5-20251101',
    maxTokens: 4096,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
  },
};

// ============================================
// Request Types & Options
// ============================================

export type AIRequestType =
  | 'socratic_hint'
  | 'flashcard_generation'
  | 'gap_analysis'
  | 'bridge_deck'
  | 'other';

export interface AIRequestOptions {
  modelTier?: AIModelTier;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  requestType: AIRequestType;
  cacheKey?: string;
  bypassCache?: boolean;
  cacheTTLHours?: number;
}

export interface AIResponse {
  text: string;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  estimatedCost: number;
  wasFromCache: boolean;
  modelUsed: string;
}

// ============================================
// Model Selection Logic
// ============================================

export function selectModelForTask(requestType: AIRequestType): AIModelTier {
  switch (requestType) {
    case 'socratic_hint':
      return AIModelTier.FAST; // Simple hints don't need powerful model

    case 'flashcard_generation':
      return AIModelTier.BALANCED; // Medium complexity

    case 'gap_analysis':
      return AIModelTier.BALANCED; // Requires reasoning but not complex

    case 'bridge_deck':
      return AIModelTier.POWERFUL; // Complex: understanding gaps + generating content

    default:
      return AIModelTier.BALANCED;
  }
}

// ============================================
// AI Service Class
// ============================================

export class AIService {
  private client: Anthropic;

  constructor() {
    if (!ServerConfig.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    this.client = new Anthropic({
      apiKey: ServerConfig.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate AI response with automatic caching and usage tracking
   */
  async generate(prompt: string, options: AIRequestOptions): Promise<AIResponse> {
    // 1. Check feature flag
    requireFeature('AI_COACH');

    // 2. Select model tier
    const modelTier = options.modelTier || selectModelForTask(options.requestType);
    const modelConfig = MODEL_CONFIG[modelTier];

    // 3. Check usage limits
    await this.checkAndUpdateUsageLimits(options.userId);

    // 4. Check cache (if enabled and not bypassed)
    if (!options.bypassCache && ServerConfig.AI_ENABLE_AGGRESSIVE_CACHE) {
      const cacheKey = options.cacheKey || this.generateCacheKey(prompt, options.requestType);
      const cached = await this.getFromCache(cacheKey);

      if (cached) {
        // Track cache hit
        await this.trackUsage({
          userId: options.userId,
          requestType: options.requestType,
          modelUsed: cached.modelUsed,
          tokensUsed: cached.tokensUsed.total,
          estimatedCost: cached.estimatedCost,
          wasFromCache: true,
        });

        return cached;
      }
    }

    // 5. Call API
    const startTime = Date.now();
    const response = await this.callAPI(prompt, modelConfig, options.temperature);
    const responseTime = Date.now() - startTime;

    // 6. Calculate costs
    const estimatedCost = this.calculateCost(
      response.usage.input_tokens,
      response.usage.output_tokens,
      modelConfig
    );

    const aiResponse: AIResponse = {
      text: response.content[0].type === 'text' ? response.content[0].text : '',
      tokensUsed: {
        input: response.usage.input_tokens,
        output: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      },
      estimatedCost,
      wasFromCache: false,
      modelUsed: modelConfig.model,
    };

    // 7. Cache response
    if (!options.bypassCache && ServerConfig.AI_ENABLE_AGGRESSIVE_CACHE) {
      const cacheKey = options.cacheKey || this.generateCacheKey(prompt, options.requestType);
      const cacheTTL = options.cacheTTLHours || ServerConfig.AI_CACHE_TTL_HOURS;
      await this.saveToCache(cacheKey, prompt, aiResponse, options.requestType, cacheTTL);
    }

    // 8. Track usage
    await this.trackUsage({
      userId: options.userId,
      requestType: options.requestType,
      modelUsed: modelConfig.model,
      tokensUsed: aiResponse.tokensUsed.total,
      estimatedCost,
      wasFromCache: false,
      responseTimeMs: responseTime,
    });

    return aiResponse;
  }

  /**
   * Call Anthropic API with retry logic
   */
  private async callAPI(
    prompt: string,
    config: ModelConfig,
    temperature = 1.0
  ): Promise<Anthropic.Message> {
    try {
      const message = await this.client.messages.create({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
      });

      return message;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        // Handle rate limiting
        if (error.status === 429) {
          throw new Error('AI service rate limit exceeded. Please try again later.');
        }

        // Handle other API errors
        throw new Error(`AI service error: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Calculate estimated cost based on tokens
   */
  private calculateCost(inputTokens: number, outputTokens: number, config: ModelConfig): number {
    const inputCost = (inputTokens / 1000) * config.costPer1kInputTokens;
    const outputCost = (outputTokens / 1000) * config.costPer1kOutputTokens;
    return Number.parseFloat((inputCost + outputCost).toFixed(6));
  }

  /**
   * Generate cache key from prompt
   */
  private generateCacheKey(prompt: string, requestType: string): string {
    const hash = createHash('sha256').update(`${requestType}:${prompt}`).digest('hex');
    return `ai:${requestType}:${hash.substring(0, 32)}`;
  }

  /**
   * Get cached response
   */
  private async getFromCache(cacheKey: string): Promise<AIResponse | null> {
    try {
      const cached = await db.query.aiResponseCache.findFirst({
        where: and(
          eq(aiResponseCache.cacheKey, cacheKey),
          gte(aiResponseCache.expiresAt, new Date())
        ),
      });

      if (!cached) return null;

      // Update hit count and last accessed
      await db
        .update(aiResponseCache)
        .set({
          hitCount: sql`${aiResponseCache.hitCount} + 1`,
          lastAccessedAt: new Date(),
        })
        .where(eq(aiResponseCache.id, cached.id));

      return {
        text: cached.response,
        tokensUsed: {
          input: 0,
          output: cached.tokensUsed,
          total: cached.tokensUsed,
        },
        estimatedCost: Number.parseFloat(cached.estimatedCost),
        wasFromCache: true,
        modelUsed: cached.modelUsed,
      };
    } catch (error) {
      console.error('Cache lookup error:', error);
      return null;
    }
  }

  /**
   * Save response to cache
   */
  private async saveToCache(
    cacheKey: string,
    prompt: string,
    response: AIResponse,
    requestType: AIRequestType,
    ttlHours: number
  ): Promise<void> {
    try {
      const promptHash = createHash('sha256').update(prompt).digest('hex');
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

      await db.insert(aiResponseCache).values({
        cacheKey,
        promptHash,
        prompt,
        response: response.text,
        modelUsed: response.modelUsed,
        requestType,
        tokensUsed: response.tokensUsed.total,
        estimatedCost: response.estimatedCost.toString(),
        expiresAt,
      } as NewAIResponseCache);
    } catch (error) {
      // Don't fail the request if caching fails
      console.error('Cache save error:', error);
    }
  }

  /**
   * Track usage
   */
  private async trackUsage(data: {
    userId: string;
    requestType: AIRequestType;
    modelUsed: string;
    tokensUsed: number;
    estimatedCost: number;
    wasFromCache: boolean;
    responseTimeMs?: number;
  }): Promise<void> {
    try {
      await db.insert(aiUsageTracking).values({
        userId: data.userId,
        requestType: data.requestType,
        modelUsed: data.modelUsed,
        tokensUsed: data.tokensUsed,
        estimatedCost: data.estimatedCost.toString(),
        wasFromCache: data.wasFromCache,
        responseTimeMs: data.responseTimeMs,
      } as NewAIUsageTracking);
    } catch (error) {
      console.error('Usage tracking error:', error);
    }
  }

  /**
   * Check and update usage limits
   */
  private async checkAndUpdateUsageLimits(userId: string): Promise<void> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get or create quota record
    let quota = await db.query.aiUsageQuotas.findFirst({
      where: eq(aiUsageQuotas.userId, userId),
    });

    if (!quota) {
      // Create new quota
      const tomorrow = new Date(startOfDay);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextMonth = new Date(startOfMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await db.insert(aiUsageQuotas).values({
        userId,
        dailyRequestCount: 0,
        dailyTokenCount: 0,
        monthlyRequestCount: 0,
        monthlyTokenCount: 0,
        dailyResetAt: tomorrow,
        monthlyResetAt: nextMonth,
      });

      quota = await db.query.aiUsageQuotas.findFirst({
        where: eq(aiUsageQuotas.userId, userId),
      });
    }

    if (!quota) throw new Error('Failed to create usage quota');

    // Check if blocked
    if (quota.isBlocked) {
      throw new Error(`AI access blocked: ${quota.blockReason || 'Quota exceeded'}`);
    }

    // Reset if needed
    if (quota.dailyResetAt <= now) {
      const tomorrow = new Date(startOfDay);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await db
        .update(aiUsageQuotas)
        .set({
          dailyRequestCount: 0,
          dailyTokenCount: 0,
          dailyResetAt: tomorrow,
        })
        .where(eq(aiUsageQuotas.userId, userId));

      quota.dailyRequestCount = 0;
    }

    if (quota.monthlyResetAt <= now) {
      const nextMonth = new Date(startOfMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await db
        .update(aiUsageQuotas)
        .set({
          monthlyRequestCount: 0,
          monthlyTokenCount: 0,
          monthlyResetAt: nextMonth,
        })
        .where(eq(aiUsageQuotas.userId, userId));

      quota.monthlyRequestCount = 0;
    }

    // Check limits
    if (quota.dailyRequestCount >= ServerConfig.AI_DAILY_REQUEST_LIMIT) {
      throw new Error(
        `Daily AI request limit (${ServerConfig.AI_DAILY_REQUEST_LIMIT}) exceeded. Resets at midnight.`
      );
    }

    if (quota.monthlyRequestCount >= ServerConfig.AI_MONTHLY_REQUEST_LIMIT) {
      throw new Error(
        `Monthly AI request limit (${ServerConfig.AI_MONTHLY_REQUEST_LIMIT}) exceeded. Resets next month.`
      );
    }

    // Increment counters
    await db
      .update(aiUsageQuotas)
      .set({
        dailyRequestCount: sql`${aiUsageQuotas.dailyRequestCount} + 1`,
        monthlyRequestCount: sql`${aiUsageQuotas.monthlyRequestCount} + 1`,
        updatedAt: now,
      })
      .where(eq(aiUsageQuotas.userId, userId));
  }
}

// ============================================
// Singleton Instance
// ============================================

let aiService: AIService | null = null;

export function getAIService(): AIService {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
}
