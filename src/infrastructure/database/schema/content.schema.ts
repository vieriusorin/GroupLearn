/**
 * Content Management Schema (PostgreSQL)
 *
 * Tables for domains, categories, flashcards, and review system.
 */

import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { DifficultyLevel, ReviewMode } from "./enums";

// ============================================
// Domains Table
// ============================================

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Categories Table
// ============================================

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id")
    .notNull()
    .references(() => domains.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isDeprecated: boolean("is_deprecated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Flashcards Table
// ============================================

export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  question: varchar("question", { length: 1000 }).notNull(),
  answer: varchar("answer", { length: 2000 }).notNull(),
  difficulty: varchar("difficulty", {
    length: 20,
    enum: [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD],
  })
    .notNull()
    .default(DifficultyLevel.MEDIUM),
  computedDifficulty: varchar("computed_difficulty", {
    length: 20,
    enum: [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD],
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Review History Table
// ============================================

export const reviewHistory = pgTable("review_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  flashcardId: integer("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  reviewMode: varchar("review_mode", {
    length: 20,
    enum: [ReviewMode.LEARN, ReviewMode.REVIEW, ReviewMode.CRAM],
  }).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  reviewDate: timestamp("review_date").notNull().defaultNow(),
  nextReviewDate: timestamp("next_review_date").notNull(),
  intervalDays: integer("interval_days").notNull(), // 1, 3, or 7 days
});

// ============================================
// Struggling Queue Table
// ============================================

export const strugglingQueue = pgTable("struggling_queue", {
  id: serial("id").primaryKey(),
  flashcardId: integer("flashcard_id")
    .notNull()
    .unique()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").notNull().defaultNow(),
  timesFailed: integer("times_failed").notNull().default(1),
  lastFailedAt: timestamp("last_failed_at").notNull().defaultNow(),
});

// ============================================
// Type Exports for TypeScript
// ============================================

export type Domain = typeof domains.$inferSelect;
export type NewDomain = typeof domains.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Flashcard = typeof flashcards.$inferSelect;
export type NewFlashcard = typeof flashcards.$inferInsert;

export type ReviewHistory = typeof reviewHistory.$inferSelect;
export type NewReviewHistory = typeof reviewHistory.$inferInsert;

export type StrugglingQueue = typeof strugglingQueue.$inferSelect;
export type NewStrugglingQueue = typeof strugglingQueue.$inferInsert;
