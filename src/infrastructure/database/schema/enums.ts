export const UserRole = {
  MEMBER: "member",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionStatus = {
  FREE: "free",
  PREMIUM: "premium",
  TRIAL: "trial",
} as const;

export type SubscriptionStatusType =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const AccountType = {
  EMAIL: "email",
  OAUTH: "oauth",
} as const;

export type AccountTypeType = (typeof AccountType)[keyof typeof AccountType];

export const AccountProvider = {
  GOOGLE: "google",
  GITHUB: "github",
  EMAIL: "email",
} as const;

export type AccountProviderType =
  (typeof AccountProvider)[keyof typeof AccountProvider];

export const PathVisibility = {
  PUBLIC: "public",
  PRIVATE: "private",
} as const;

export type PathVisibilityType =
  (typeof PathVisibility)[keyof typeof PathVisibility];

export const UnlockRequirementType = {
  NONE: "none",
  PREVIOUS_PATH: "previous_path",
  XP_THRESHOLD: "xp_threshold",
  ADMIN_APPROVAL: "admin_approval",
} as const;

export type UnlockRequirementTypeType =
  (typeof UnlockRequirementType)[keyof typeof UnlockRequirementType];

export const DifficultyLevel = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export type DifficultyLevelType =
  (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

export const ReviewMode = {
  LEARN: "learn",
  REVIEW: "review",
  CRAM: "cram",
} as const;

export type ReviewModeType = (typeof ReviewMode)[keyof typeof ReviewMode];

export const GroupRole = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type GroupRoleType = (typeof GroupRole)[keyof typeof GroupRole];

export const InvitationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;

export type InvitationStatusType =
  (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const XPSourceType = {
  LESSON_COMPLETION: "lesson_completion",
  PERFECT_LESSON: "perfect_lesson",
  STREAK_BONUS: "streak_bonus",
  DAILY_GOAL: "daily_goal",
  ACHIEVEMENT: "achievement",
  ADMIN_GRANT: "admin_grant",
} as const;

export type XPSourceTypeType = (typeof XPSourceType)[keyof typeof XPSourceType];

export const HeartsTransactionReason = {
  WRONG_ANSWER: "wrong_answer",
  REFILL: "refill",
  PURCHASE: "purchase",
  ADMIN_GRANT: "admin_grant",
  DAILY_RESET: "daily_reset",
} as const;

export type HeartsTransactionReasonType =
  (typeof HeartsTransactionReason)[keyof typeof HeartsTransactionReason];

export const ActivityType = {
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  FLASHCARD_REVIEWED: "flashcard_reviewed",
  STREAK_ACHIEVED: "streak_achieved",
  PATH_STARTED: "path_started",
  PATH_COMPLETED: "path_completed",
  GROUP_JOINED: "group_joined",
  GROUP_LEFT: "group_left",
} as const;

export type ActivityTypeType = (typeof ActivityType)[keyof typeof ActivityType];
