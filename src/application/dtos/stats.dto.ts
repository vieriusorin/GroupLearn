import type { XPTransaction } from "@/infrastructure/database/schema";

export type GlobalLeaderboardEntry = {
  userId: string;
  userName: string | null;
  userEmail: string;
  totalXp: number;
  rank: number;
};

export type LeaderboardData = {
  period: "all-time" | "7days" | "30days";
  leaderboard: GlobalLeaderboardEntry[];
  userRank: number | null;
  userXP: number;
};

export type XpHistoryData = {
  transactions: XPTransaction[];
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
};

/**
 * Get leaderboard result
 * Returned when fetching leaderboard data
 */
export type GetLeaderboardResult = {
  data: LeaderboardData;
};

/**
 * Get XP history result
 * Returned when fetching XP history
 */
export type GetXPHistoryResult = {
  data: XpHistoryData;
};

/**
 * User statistics data
 */
export type UserStats = {
  totalXp: number;
  streakCount: number;
  lessonsCompletedToday: number;
  totalLessonsCompleted: number;
  xpEarnedToday: number;
};

/**
 * Get user stats result
 * Returned when fetching user statistics
 */
export type GetUserStatsResult = {
  stats: UserStats;
};
