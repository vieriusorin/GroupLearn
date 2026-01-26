/**
 * Real-Time Feature DTOs
 *
 * Data Transfer Objects for live sessions, presence, and real-time features.
 */

import type {
  LiveSession,
  LiveSessionParticipant,
  LiveSessionAnswer,
  OnlinePresence,
} from "@/infrastructure/database/schema";

// ============================================
// Live Session Types
// ============================================

export type LiveSessionWithParticipants = LiveSession & {
  participants: LiveSessionParticipantWithUser[];
  participantCount: number;
  hostName?: string | null;
};

export type LiveSessionParticipantWithUser = LiveSessionParticipant & {
  userName: string | null;
  userImage: string | null;
};

export type LiveSessionDetail = LiveSession & {
  participants: LiveSessionParticipantWithUser[];
  participantCount: number;
  hostName?: string | null;
  hostImage?: string | null;
  categoryName?: string | null;
  selectedFlashcards?: Array<{
    id: number;
    question: string;
    answer: string;
    difficulty: string;
  }>;
};

export type LeaderboardEntry = {
  userId: string;
  userName: string;
  userImage: string | null;
  totalScore: number;
  rank: number;
  correctAnswers: number;
  totalAnswers: number;
  averageResponseTime: number;
};

export type LiveSessionStats = {
  totalParticipants: number;
  totalAnswers: number;
  averageScore: number;
  fastestResponseTime: number;
  currentCardIndex: number;
  totalCards: number;
};

// ============================================
// Command Results
// ============================================

export type CreateLiveSessionResult = {
  success: boolean;
  data?: {
    id: number;
    sessionType: string;
    groupId: number;
    hostId: string;
    status: string;
    config: Record<string, any>;
    createdAt: string;
  };
  error?: string;
};

export type JoinLiveSessionResult = {
  success: boolean;
  data?: {
    sessionId: number;
    userId: string;
    joinedAt: string;
  };
  error?: string;
};

export type StartLiveSessionResult = {
  success: boolean;
  data?: {
    sessionId: number;
    status: string;
    startedAt: string;
    selectedFlashcards: number[];
  };
  error?: string;
};

export type SubmitLiveAnswerResult = {
  success: boolean;
  data?: {
    answerId: number;
    isCorrect: boolean;
    pointsEarned: number;
    newTotalScore: number;
    newRank: number;
  };
  error?: string;
};

export type EndLiveSessionResult = {
  success: boolean;
  data?: {
    sessionId: number;
    status: string;
    endedAt: string;
    finalLeaderboard: LeaderboardEntry[];
    xpAwarded: Record<string, number>; // userId -> XP amount
  };
  error?: string;
};

// ============================================
// Query Results
// ============================================

export type GetActiveLiveSessionsResult = {
  success: boolean;
  data?: LiveSessionWithParticipants[];
  error?: string;
};

export type GetLiveSessionDetailResult = {
  success: boolean;
  data?: LiveSessionDetail;
  error?: string;
};

export type GetLiveSessionLeaderboardResult = {
  success: boolean;
  data?: {
    leaderboard: LeaderboardEntry[];
    stats: LiveSessionStats;
  };
  error?: string;
};

// ============================================
// Presence Types
// ============================================

export type OnlinePresenceWithUser = OnlinePresence & {
  userName: string | null;
  userImage: string | null;
};

export type GroupPresenceInfo = {
  groupId: number;
  onlineCount: number;
  onlineUsers: OnlinePresenceWithUser[];
};

// ============================================
// Real-Time Event Types
// ============================================

export type LiveSessionEvent =
  | { type: "session:created"; payload: { sessionId: number; groupId: number } }
  | { type: "session:started"; payload: { sessionId: number; startedAt: string } }
  | { type: "session:participant_joined"; payload: { sessionId: number; userId: string; userName: string } }
  | { type: "session:participant_left"; payload: { sessionId: number; userId: string } }
  | { type: "session:card_revealed"; payload: { sessionId: number; cardIndex: number; flashcard: any; timeLimit: number } }
  | { type: "session:answer_submitted"; payload: { sessionId: number; userId: string; isCorrect: boolean; points: number } }
  | { type: "session:leaderboard_updated"; payload: { sessionId: number; leaderboard: LeaderboardEntry[] } }
  | { type: "session:ended"; payload: { sessionId: number; finalLeaderboard: LeaderboardEntry[] } };

export type PresenceEvent =
  | { type: "presence:user_online"; payload: { userId: string; userName: string; groupId?: number } }
  | { type: "presence:user_offline"; payload: { userId: string; groupId?: number } }
  | { type: "presence:user_away"; payload: { userId: string; groupId?: number } }
  | { type: "presence:group_state"; payload: { groupId: number; onlineUsers: OnlinePresenceWithUser[] } };
