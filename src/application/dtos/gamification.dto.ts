import type {
  DailyStreak,
  HeartsTransaction,
  NewHeartsTransaction,
  NewXPTransaction,
  UserProgress,
  XPTransaction,
} from "@/infrastructure/database/schema";

export type UserProgressExtended = UserProgress & {
  completionPercent?: number;
  totalUnits?: number;
  completedUnits?: number;
  totalLessons?: number;
  completedLessons?: number;
};

export type UserProgressWithPath = UserProgress & {
  pathName?: string;
  pathIcon?: string | null;
};

export type XPTransactionWithDetails = XPTransaction & {
  sourceName?: string;
  lessonName?: string;
};

export type CreateXPTransactionInput = Omit<
  NewXPTransaction,
  "id" | "createdAt"
>;

export type HeartsTransactionWithDetails = HeartsTransaction & {
  lessonName?: string;
};

export type CreateHeartsTransactionInput = Omit<
  NewHeartsTransaction,
  "id" | "createdAt"
>;

export type StreakInfo = DailyStreak & {
  isActive?: boolean;
  daysUntilNextMilestone?: number;
  nextMilestone?: number;
};

export type DashboardStats = {
  totalCards: number;
  cardsDueToday: number;
  cardsReviewedToday: number;
  currentStreak: number;
  strugglingCards: number;
  domainsProgress: DomainProgress[];
};

export type DomainProgress = {
  domain: {
    id: number;
    name: string;
    description?: string | null;
  };
  totalCards: number;
  masteredCards: number;
  dueCards: number;
};

/**
 * User progress item
 * Based on UserProgress aggregate with computed fields
 */
export type UserProgressItem = {
  id: number | null;
  userId: string;
  pathId: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  hearts: number;
  maxHearts: number;
  streakCount: number;
  lastHeartRefill: string; // ISO string
  lastActivityDate: string | null; // ISO string
  currentUnitId: number | null;
  currentLessonId: number | null;
  startedAt: string; // ISO string
  completedAt: string | null; // ISO string
  timeSpentTotal: number;
  isCompleted: boolean;
};

/**
 * Get user progress result
 * Returned when fetching user progress for a path
 */
export type GetUserProgressResult = {
  progress: UserProgressItem;
};

/**
 * Refill hearts result
 * Returned when refilling user hearts
 */
export type RefillHeartsResult = {
  success: boolean;
  heartsBefore: number;
  heartsAfter: number;
  heartsRestored: number;
  nextRefillTime: string; // ISO string
  refillProgress: number;
};

/**
 * Update streak result
 * Returned when updating user streak
 */
export type UpdateStreakResult = {
  success: boolean;
  streakCount: number;
  previousStreakCount: number;
  streakBroken: boolean;
  lastActivityDate: string; // ISO string
};

/**
 * Get stats result
 * Returned when fetching dashboard statistics
 */
export type GetStatsResult = {
  stats: DashboardStats;
};
