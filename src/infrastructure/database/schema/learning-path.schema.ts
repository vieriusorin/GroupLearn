/**
 * Learning Path Schema (PostgreSQL)
 *
 * Tables for paths, units, lessons, and completions.
 * Duolingo-style structured learning system.
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
import { domains, flashcards } from "./content.schema";
import { PathVisibility, UnlockRequirementType } from "./enums";

// ============================================
// Paths Table (Learning Tracks)
// ============================================

export const paths = pgTable("paths", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id")
    .notNull()
    .references(() => domains.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  orderIndex: integer("order_index").notNull().default(0),
  isLocked: boolean("is_locked").notNull().default(false),
  unlockRequirementType: varchar("unlock_requirement_type", {
    length: 50,
    enum: [
      UnlockRequirementType.NONE,
      UnlockRequirementType.PREVIOUS_PATH,
      UnlockRequirementType.XP_THRESHOLD,
      UnlockRequirementType.ADMIN_APPROVAL,
    ],
  }),
  unlockRequirementValue: integer("unlock_requirement_value"),
  visibility: varchar("visibility", {
    length: 20,
    enum: [PathVisibility.PUBLIC, PathVisibility.PRIVATE],
  })
    .notNull()
    .default(PathVisibility.PUBLIC),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Path Approvals Table
// ============================================

export const pathApprovals = pgTable("path_approvals", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  approvedBy: text("approved_by")
    .notNull()
    .references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at").notNull().defaultNow(),
});

// ============================================
// Units Table (Groups of Lessons)
// ============================================

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  unitNumber: integer("unit_number").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lessons Table (Playable Units)
// ============================================

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(5),
  flashcardCount: integer("flashcard_count").notNull().default(5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Lesson Flashcards Table (Many-to-Many)
// ============================================

export const lessonFlashcards = pgTable("lesson_flashcards", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  flashcardId: integer("flashcard_id")
    .notNull()
    .references(() => flashcards.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull().default(0),
});

// ============================================
// Lesson Completions Table (Historical Record)
// ============================================

export const lessonCompletions = pgTable("lesson_completions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  xpEarned: integer("xp_earned").notNull(),
  accuracyPercent: integer("accuracy_percent").notNull(),
  timeSpentSeconds: integer("time_spent_seconds"),
  heartsRemaining: integer("hearts_remaining").notNull(),
});

// ============================================
// Type Exports for TypeScript
// ============================================

export type Path = typeof paths.$inferSelect;
export type NewPath = typeof paths.$inferInsert;

export type PathApproval = typeof pathApprovals.$inferSelect;
export type NewPathApproval = typeof pathApprovals.$inferInsert;

export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type LessonFlashcard = typeof lessonFlashcards.$inferSelect;
export type NewLessonFlashcard = typeof lessonFlashcards.$inferInsert;

export type LessonCompletion = typeof lessonCompletions.$inferSelect;
export type NewLessonCompletion = typeof lessonCompletions.$inferInsert;
