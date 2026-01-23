export * from "./analytics.schema";
export * from "./auth.schema";
export * from "./content.schema";
export * from "./enums";
export * from "./gamification.schema";
export * from "./groups.schema";
export * from "./learning-path.schema";
export * from "./realtime.schema";
export * from "./ai.schema";

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

import {
  onlinePresence,
  liveSessions,
  liveSessionParticipants,
  liveSessionAnswers,
} from "./realtime.schema";

import {
  aiGeneratedContent,
  aiResponseCache,
  aiUsageTracking,
  aiHints,
  knowledgeGaps,
  aiUsageQuotas,
} from "./ai.schema";

export const schema = {
  users,
  accounts,
  sessions,
  verification,

  domains,
  categories,
  flashcards,
  reviewHistory,
  strugglingQueue,

  paths,
  pathApprovals,
  units,
  lessons,
  lessonFlashcards,
  lessonCompletions,

  userProgress,
  xpTransactions,
  heartsTransactions,
  dailyStreaks,

  groups,
  groupMembers,
  groupInvitations,
  invitationPaths,
  groupPaths,
  groupPathVisibility,

  userActivityLog,
  groupMemberAnalytics,

  // Real-time features
  onlinePresence,
  liveSessions,
  liveSessionParticipants,
  liveSessionAnswers,

  // AI features
  aiGeneratedContent,
  aiResponseCache,
  aiUsageTracking,
  aiHints,
  knowledgeGaps,
  aiUsageQuotas,
};
