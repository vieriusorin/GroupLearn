/**
 * AI & Machine Learning Schema
 *
 * Database schema for AI-powered features including content generation,
 * usage tracking, caching, and knowledge gap analysis
 */

import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  varchar,
  jsonb,
  boolean,
  decimal,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { users } from './auth.schema';
import { groups } from './groups.schema';
import { flashcards, categories } from './content.schema';

/**
 * AI Generated Content
 *
 * Stores AI-generated flashcards from various sources (PDF, URL, text, audio)
 */
export const aiGeneratedContent = pgTable(
  'ai_generated_content',
  {
    id: serial('id').primaryKey(),
    sourceType: varchar('source_type', {
      length: 20,
      enum: ['pdf', 'url', 'text', 'audio'],
    }).notNull(),
    sourceUrl: text('source_url'), // S3 key or original URL
    sourceFileName: varchar('source_file_name', { length: 255 }),
    extractedText: text('extracted_text'), // Full text extraction
    generatedCards: jsonb('generated_cards').$type<
      Array<{
        question: string;
        answer: string;
        difficulty: 'easy' | 'medium' | 'hard';
        hints?: string;
      }>
    >(),
    status: varchar('status', {
      length: 20,
      enum: ['pending', 'processing', 'completed', 'failed'],
    })
      .notNull()
      .default('pending'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    modelUsed: varchar('model_used', { length: 100 }),
    tokensUsed: integer('tokens_used'),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }),
    errorMessage: text('error_message'),
    approvedCount: integer('approved_count').notNull().default(0),
    rejectedCount: integer('rejected_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    completedAt: timestamp('completed_at'),
  },
  (table) => ({
    userIdIdx: index('ai_content_user_idx').on(table.userId),
    statusIdx: index('ai_content_status_idx').on(table.status),
    createdAtIdx: index('ai_content_created_idx').on(table.createdAt),
  })
);

/**
 * AI Response Cache
 *
 * Aggressive caching of AI responses to reduce API costs
 */
export const aiResponseCache = pgTable(
  'ai_response_cache',
  {
    id: serial('id').primaryKey(),
    cacheKey: varchar('cache_key', { length: 255 }).notNull().unique(),
    promptHash: varchar('prompt_hash', { length: 64 }).notNull(), // SHA-256 hash
    prompt: text('prompt').notNull(),
    response: text('response').notNull(),
    modelUsed: varchar('model_used', { length: 100 }).notNull(),
    requestType: varchar('request_type', {
      length: 50,
      enum: ['socratic_hint', 'flashcard_generation', 'gap_analysis', 'bridge_deck', 'other'],
    }).notNull(),
    tokensUsed: integer('tokens_used').notNull(),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }).notNull(),
    hitCount: integer('hit_count').notNull().default(0),
    lastAccessedAt: timestamp('last_accessed_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(), // Cache TTL
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    cacheKeyIdx: index('ai_cache_key_idx').on(table.cacheKey),
    promptHashIdx: index('ai_cache_prompt_hash_idx').on(table.promptHash),
    expiresAtIdx: index('ai_cache_expires_idx').on(table.expiresAt),
    requestTypeIdx: index('ai_cache_request_type_idx').on(table.requestType),
    lastAccessedIdx: index('ai_cache_last_accessed_idx').on(table.lastAccessedAt),
  })
);

/**
 * AI Usage Tracking
 *
 * Per-user AI usage tracking for enforcing limits
 */
export const aiUsageTracking = pgTable(
  'ai_usage_tracking',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    requestType: varchar('request_type', {
      length: 50,
      enum: ['socratic_hint', 'flashcard_generation', 'gap_analysis', 'bridge_deck', 'other'],
    }).notNull(),
    modelUsed: varchar('model_used', { length: 100 }).notNull(),
    tokensUsed: integer('tokens_used').notNull(),
    estimatedCost: decimal('estimated_cost', { precision: 10, scale: 6 }).notNull(),
    wasFromCache: boolean('was_from_cache').notNull().default(false),
    responseTimeMs: integer('response_time_ms'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('ai_usage_user_idx').on(table.userId),
    createdAtIdx: index('ai_usage_created_idx').on(table.createdAt),
    userDateIdx: index('ai_usage_user_date_idx').on(table.userId, table.createdAt),
    requestTypeIdx: index('ai_usage_request_type_idx').on(table.requestType),
  })
);

/**
 * AI Hints Cache
 *
 * Specific cache for Socratic hints on flashcards
 */
export const aiHints = pgTable(
  'ai_hints',
  {
    id: serial('id').primaryKey(),
    flashcardId: integer('flashcard_id')
      .notNull()
      .references(() => flashcards.id, { onDelete: 'cascade' }),
    hint: text('hint').notNull(),
    modelUsed: varchar('model_used', { length: 100 }).notNull(),
    tokensUsed: integer('tokens_used').notNull(),
    requestCount: integer('request_count').notNull().default(1),
    lastRequestedAt: timestamp('last_requested_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    flashcardIdIdx: index('ai_hints_flashcard_idx').on(table.flashcardId),
    expiresAtIdx: index('ai_hints_expires_idx').on(table.expiresAt),
    flashcardUniqueIdx: unique('ai_hints_flashcard_unique_idx').on(table.flashcardId),
  })
);

/**
 * Knowledge Gaps
 *
 * AI-detected knowledge gaps for groups
 */
export const knowledgeGaps = pgTable(
  'knowledge_gaps',
  {
    id: serial('id').primaryKey(),
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    topic: varchar('topic', { length: 255 }).notNull(),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
    successRate: integer('success_rate').notNull(), // 0-100
    affectedUserCount: integer('affected_user_count').notNull(),
    totalUsers: integer('total_users').notNull(),
    prerequisiteConcepts: jsonb('prerequisite_concepts').$type<string[]>(),
    recommendedActions: jsonb('recommended_actions').$type<
      Array<{
        action: string;
        priority: 'high' | 'medium' | 'low';
        description: string;
      }>
    >(),
    bridgeDeckGenerated: boolean('bridge_deck_generated').notNull().default(false),
    bridgeDeckId: integer('bridge_deck_id'), // Reference to generated content
    severity: varchar('severity', {
      length: 20,
      enum: ['critical', 'high', 'medium', 'low'],
    })
      .notNull()
      .default('medium'),
    status: varchar('status', {
      length: 20,
      enum: ['active', 'addressed', 'ignored'],
    })
      .notNull()
      .default('active'),
    detectedAt: timestamp('detected_at').notNull().defaultNow(),
    addressedAt: timestamp('addressed_at'),
  },
  (table) => ({
    groupIdIdx: index('knowledge_gaps_group_idx').on(table.groupId),
    categoryIdIdx: index('knowledge_gaps_category_idx').on(table.categoryId),
    statusIdx: index('knowledge_gaps_status_idx').on(table.status),
    severityIdx: index('knowledge_gaps_severity_idx').on(table.severity),
  })
);

/**
 * AI Usage Quotas
 *
 * Per-user quota management (daily/monthly limits)
 */
export const aiUsageQuotas = pgTable(
  'ai_usage_quotas',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    dailyRequestCount: integer('daily_request_count').notNull().default(0),
    dailyTokenCount: integer('daily_token_count').notNull().default(0),
    monthlyRequestCount: integer('monthly_request_count').notNull().default(0),
    monthlyTokenCount: integer('monthly_token_count').notNull().default(0),
    dailyResetAt: timestamp('daily_reset_at').notNull(),
    monthlyResetAt: timestamp('monthly_reset_at').notNull(),
    isBlocked: boolean('is_blocked').notNull().default(false),
    blockReason: text('block_reason'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('ai_quotas_user_idx').on(table.userId),
    dailyResetIdx: index('ai_quotas_daily_reset_idx').on(table.dailyResetAt),
    monthlyResetIdx: index('ai_quotas_monthly_reset_idx').on(table.monthlyResetAt),
  })
);

// Type exports
export type AIGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type NewAIGeneratedContent = typeof aiGeneratedContent.$inferInsert;

export type AIResponseCache = typeof aiResponseCache.$inferSelect;
export type NewAIResponseCache = typeof aiResponseCache.$inferInsert;

export type AIUsageTracking = typeof aiUsageTracking.$inferSelect;
export type NewAIUsageTracking = typeof aiUsageTracking.$inferInsert;

export type AIHint = typeof aiHints.$inferSelect;
export type NewAIHint = typeof aiHints.$inferInsert;

export type KnowledgeGap = typeof knowledgeGaps.$inferSelect;
export type NewKnowledgeGap = typeof knowledgeGaps.$inferInsert;

export type AIUsageQuota = typeof aiUsageQuotas.$inferSelect;
export type NewAIUsageQuota = typeof aiUsageQuotas.$inferInsert;
