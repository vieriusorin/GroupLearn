/**
 * Database Schema Index
 *
 * Central export point for all database schemas, tables, and types.
 * Import from this file to access any schema definition.
 */

// ============================================
// Enums
// ============================================

export * from "./enums";

// ============================================
// Authentication Schema
// ============================================

export * from "./auth.schema";

// ============================================
// Content Management Schema
// ============================================

export * from "./content.schema";

// ============================================
// Learning Path Schema
// ============================================

export * from "./learning-path.schema";

// ============================================
// Gamification Schema
// ============================================

export * from "./gamification.schema";

// ============================================
// Groups & Collaboration Schema
// ============================================

export * from "./groups.schema";

// ============================================
// Analytics Schema
// ============================================

export * from "./analytics.schema";

// ============================================
// Combined Schema Object (for Drizzle)
// ============================================

import { groupMemberAnalytics, userActivityLog } from "./analytics.schema";
import { accounts, sessions, users, verification } from "./auth.schema";
import {
  categories,
  domains,
  flashcards,
  reviewHistory,
  strugglingQueue,
} from "./content.schema";

import {
  dailyStreaks,
  heartsTransactions,
  userProgress,
  xpTransactions,
} from "./gamification.schema";

import {
  groupInvitations,
  groupMembers,
  groupPaths,
  groupPathVisibility,
  groups,
  invitationPaths,
} from "./groups.schema";
import {
  lessonCompletions,
  lessonFlashcards,
  lessons,
  pathApprovals,
  paths,
  units,
} from "./learning-path.schema";

/**
 * Complete database schema for Drizzle ORM
 * Use this with drizzle() to initialize the database client
 */
export const schema = {
  // Authentication (4 tables)
  users,
  accounts,
  sessions,
  verification,

  // Content Management (5 tables)
  domains,
  categories,
  flashcards,
  reviewHistory,
  strugglingQueue,

  // Learning Paths (6 tables)
  paths,
  pathApprovals,
  units,
  lessons,
  lessonFlashcards,
  lessonCompletions,

  // Gamification (4 tables)
  userProgress,
  xpTransactions,
  heartsTransactions,
  dailyStreaks,

  // Groups & Collaboration (6 tables)
  groups,
  groupMembers,
  groupInvitations,
  invitationPaths,
  groupPaths,
  groupPathVisibility,

  // Analytics (2 tables)
  userActivityLog,
  groupMemberAnalytics,
};

// Total: 31 tables
