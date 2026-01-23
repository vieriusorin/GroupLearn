import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { HeartsTransactionReason, XPSourceType } from "./enums";
import { groups } from "./groups.schema";
import { lessons, paths, units } from "./learning-path.schema";

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
  groupId: integer("group_id").references(() => groups.id, {
    onDelete: "set null",
  }),
  currentUnitId: integer("current_unit_id").references(() => units.id, {
    onDelete: "set null",
  }),
  currentLessonId: integer("current_lesson_id").references(() => lessons.id, {
    onDelete: "set null",
  }),
  totalXp: integer("total_xp").notNull().default(0),
  hearts: integer("hearts").notNull().default(5),
  lastHeartRefill: timestamp("last_heart_refill").notNull().defaultNow(),
  streakCount: integer("streak_count").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  timeSpentTotal: integer("time_spent_total").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pathId: integer("path_id")
    .notNull()
    .references(() => paths.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  sourceType: varchar("source_type", {
    length: 50,
    enum: [
      XPSourceType.LESSON_COMPLETION,
      XPSourceType.PERFECT_LESSON,
      XPSourceType.STREAK_BONUS,
      XPSourceType.DAILY_GOAL,
      XPSourceType.ACHIEVEMENT,
      XPSourceType.ADMIN_GRANT,
    ],
  }).notNull(),
  sourceId: integer("source_id"), // Lesson ID, Achievement ID, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const heartsTransactions = pgTable("hearts_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // Positive for gain, negative for loss
  reason: varchar("reason", {
    length: 50,
    enum: [
      HeartsTransactionReason.WRONG_ANSWER,
      HeartsTransactionReason.REFILL,
      HeartsTransactionReason.PURCHASE,
      HeartsTransactionReason.ADMIN_GRANT,
      HeartsTransactionReason.DAILY_RESET,
    ],
  }).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dailyStreaks = pgTable("daily_streaks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type NewUserProgress = typeof userProgress.$inferInsert;

export type XPTransaction = typeof xpTransactions.$inferSelect;
export type NewXPTransaction = typeof xpTransactions.$inferInsert;

export type HeartsTransaction = typeof heartsTransactions.$inferSelect;
export type NewHeartsTransaction = typeof heartsTransactions.$inferInsert;

export type DailyStreak = typeof dailyStreaks.$inferSelect;
export type NewDailyStreak = typeof dailyStreaks.$inferInsert;
