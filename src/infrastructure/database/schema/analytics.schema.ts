/**
 * Analytics & Activity Tracking Schema (PostgreSQL)
 *
 * Tables for user activity logs and group member analytics.
 */

import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { ActivityType } from "./enums";
import { groups } from "./groups.schema";

// ============================================
// User Activity Log Table
// ============================================

export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  activityType: varchar("activity_type", {
    length: 50,
    enum: [
      ActivityType.LESSON_STARTED,
      ActivityType.LESSON_COMPLETED,
      ActivityType.FLASHCARD_REVIEWED,
      ActivityType.STREAK_ACHIEVED,
      ActivityType.PATH_STARTED,
      ActivityType.PATH_COMPLETED,
      ActivityType.GROUP_JOINED,
      ActivityType.GROUP_LEFT,
    ],
  }).notNull(),
  activityDetails: text("activity_details"), // JSON string with additional details
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// Group Member Analytics Table
// ============================================

export const groupMemberAnalytics = pgTable("group_member_analytics", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  totalLessonsCompleted: integer("total_lessons_completed").default(0),
  totalFlashcardsReviewed: integer("total_flashcards_reviewed").default(0),
  totalTimeSpent: integer("total_time_spent").default(0), // In seconds
  averageScore: real("average_score").default(0), // 0-100 percentage
  lastActivityAt: timestamp("last_activity_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Type Exports for TypeScript
// ============================================

export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type NewUserActivityLog = typeof userActivityLog.$inferInsert;

export type GroupMemberAnalytics = typeof groupMemberAnalytics.$inferSelect;
export type NewGroupMemberAnalytics = typeof groupMemberAnalytics.$inferInsert;
