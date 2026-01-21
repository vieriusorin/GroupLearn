/**
 * Zod Schemas Generated from Drizzle Tables
 *
 * These schemas are automatically generated from Drizzle table definitions
 * and can be used for form validation in React components.
 *
 * Usage in React components:
 * ```tsx
 * import { insertUserSchema, selectUserSchema } from '@/infrastructure/database/schema/zod-schemas';
 *
 * // For form validation (creating new records)
 * const formSchema = insertUserSchema.pick({
 *   name: true,
 *   email: true,
 * });
 *
 * // For validation of existing records
 * const validated = selectUserSchema.parse(data);
 * ```
 */

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { groupMemberAnalytics, userActivityLog } from "./analytics.schema";
// Import all tables
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

// ============================================
// Authentication Schemas
// ============================================

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);

export const insertVerificationSchema = createInsertSchema(verification);
export const selectVerificationSchema = createSelectSchema(verification);

// ============================================
// Content Management Schemas
// ============================================

export const insertDomainSchema = createInsertSchema(domains, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export const selectDomainSchema = createSelectSchema(domains);

export const insertCategorySchema = createInsertSchema(categories, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export const selectCategorySchema = createSelectSchema(categories);

export const insertFlashcardSchema = createInsertSchema(flashcards, {
  question: z.string().min(1).max(1000),
  answer: z.string().min(1).max(2000),
});
export const selectFlashcardSchema = createSelectSchema(flashcards);

export const insertReviewHistorySchema = createInsertSchema(reviewHistory);
export const selectReviewHistorySchema = createSelectSchema(reviewHistory);

export const insertStrugglingQueueSchema = createInsertSchema(strugglingQueue);
export const selectStrugglingQueueSchema = createSelectSchema(strugglingQueue);

// ============================================
// Learning Path Schemas
// ============================================

export const insertPathSchema = createInsertSchema(paths, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export const selectPathSchema = createSelectSchema(paths);

export const insertPathApprovalSchema = createInsertSchema(pathApprovals);
export const selectPathApprovalSchema = createSelectSchema(pathApprovals);

export const insertUnitSchema = createInsertSchema(units, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  xpReward: z.number().int().positive(),
});
export const selectUnitSchema = createSelectSchema(units);

export const insertLessonSchema = createInsertSchema(lessons, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  xpReward: z.number().int().positive(),
  flashcardCount: z.number().int().positive(),
});
export const selectLessonSchema = createSelectSchema(lessons);

export const insertLessonFlashcardSchema = createInsertSchema(lessonFlashcards);
export const selectLessonFlashcardSchema = createSelectSchema(lessonFlashcards);

export const insertLessonCompletionSchema = createInsertSchema(
  lessonCompletions,
  {
    xpEarned: z.number().int().nonnegative(),
    accuracyPercent: z.number().int().min(0).max(100),
    heartsRemaining: z.number().int().min(0).max(5),
  },
);
export const selectLessonCompletionSchema =
  createSelectSchema(lessonCompletions);

// ============================================
// Gamification Schemas
// ============================================

export const insertUserProgressSchema = createInsertSchema(userProgress, {
  totalXp: z.number().int().nonnegative(),
  hearts: z.number().int().min(0).max(5),
  streakCount: z.number().int().nonnegative(),
});
export const selectUserProgressSchema = createSelectSchema(userProgress);

export const insertXPTransactionSchema = createInsertSchema(xpTransactions, {
  amount: z.number().int(),
});
export const selectXPTransactionSchema = createSelectSchema(xpTransactions);

export const insertHeartsTransactionSchema = createInsertSchema(
  heartsTransactions,
  {
    amount: z.number().int(),
  },
);
export const selectHeartsTransactionSchema =
  createSelectSchema(heartsTransactions);

export const insertDailyStreakSchema = createInsertSchema(dailyStreaks, {
  currentStreak: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
});
export const selectDailyStreakSchema = createSelectSchema(dailyStreaks);

// ============================================
// Groups & Collaboration Schemas
// ============================================

export const insertGroupSchema = createInsertSchema(groups, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
export const selectGroupSchema = createSelectSchema(groups);

export const insertGroupMemberSchema = createInsertSchema(groupMembers);
export const selectGroupMemberSchema = createSelectSchema(groupMembers);

export const insertGroupInvitationSchema = createInsertSchema(
  groupInvitations,
  {
    email: z.string().email(),
  },
);
export const selectGroupInvitationSchema = createSelectSchema(groupInvitations);

export const insertInvitationPathSchema = createInsertSchema(invitationPaths);
export const selectInvitationPathSchema = createSelectSchema(invitationPaths);

export const insertGroupPathSchema = createInsertSchema(groupPaths);
export const selectGroupPathSchema = createSelectSchema(groupPaths);

export const insertGroupPathVisibilitySchema =
  createInsertSchema(groupPathVisibility);
export const selectGroupPathVisibilitySchema =
  createSelectSchema(groupPathVisibility);

// ============================================
// Analytics Schemas
// ============================================

export const insertUserActivityLogSchema = createInsertSchema(userActivityLog);
export const selectUserActivityLogSchema = createSelectSchema(userActivityLog);

export const insertGroupMemberAnalyticsSchema = createInsertSchema(
  groupMemberAnalytics,
  {
    totalLessonsCompleted: z.number().int().nonnegative(),
    totalFlashcardsReviewed: z.number().int().nonnegative(),
    totalTimeSpent: z.number().int().nonnegative(),
    averageScore: z.number().min(0).max(100),
  },
);
export const selectGroupMemberAnalyticsSchema =
  createSelectSchema(groupMemberAnalytics);

// ============================================
// Form-Specific Schemas (Examples)
// ============================================

/**
 * Example form schemas for common use cases
 * These can be imported directly into React components
 */

// Create User Form
export const createUserFormSchema = insertUserSchema
  .pick({
    name: true,
    email: true,
    password: true,
  })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Create Domain Form
export const createDomainFormSchema = insertDomainSchema.pick({
  name: true,
  description: true,
});

// Create Category Form
export const createCategoryFormSchema = insertCategorySchema.pick({
  domainId: true,
  name: true,
  description: true,
});

// Create Flashcard Form
export const createFlashcardFormSchema = insertFlashcardSchema.pick({
  categoryId: true,
  question: true,
  answer: true,
  difficulty: true,
});

// Create Path Form
export const createPathFormSchema = insertPathSchema.pick({
  domainId: true,
  name: true,
  description: true,
  icon: true,
  visibility: true,
});

// Create Lesson Form
export const createLessonFormSchema = insertLessonSchema.pick({
  unitId: true,
  name: true,
  description: true,
  xpReward: true,
  flashcardCount: true,
});

// Create Group Form
export const createGroupFormSchema = insertGroupSchema.pick({
  name: true,
  description: true,
});

// Invite to Group Form
export const inviteToGroupFormSchema = insertGroupInvitationSchema.pick({
  groupId: true,
  email: true,
  role: true,
});

// ============================================
// Type Exports
// ============================================

// These types can be used in React components
export type CreateUserForm = z.infer<typeof createUserFormSchema>;
export type CreateDomainForm = z.infer<typeof createDomainFormSchema>;
export type CreateCategoryForm = z.infer<typeof createCategoryFormSchema>;
export type CreateFlashcardForm = z.infer<typeof createFlashcardFormSchema>;
export type CreatePathForm = z.infer<typeof createPathFormSchema>;
export type CreateLessonForm = z.infer<typeof createLessonFormSchema>;
export type CreateGroupForm = z.infer<typeof createGroupFormSchema>;
export type InviteToGroupForm = z.infer<typeof inviteToGroupFormSchema>;
