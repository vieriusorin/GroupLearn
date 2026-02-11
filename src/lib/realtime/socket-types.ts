/**
 * Socket.io Event Types
 *
 * Centralized type definitions for all real-time events
 */

import type { Socket } from 'socket.io-client';

// ============================================
// Presence Events
// ============================================

export interface PresenceJoinPayload {
  groupId?: number;
  sessionId?: number;
}

export interface PresenceLeavePayload {
  groupId?: number;
  sessionId?: number;
}

export interface PresenceUserJoinedPayload {
  userId: string;
  userName?: string;
  groupId?: number;
  sessionId?: number;
  timestamp?: string;
}

export interface PresenceUserLeftPayload {
  userId: string;
  userName?: string;
  groupId?: number;
  sessionId?: number;
  timestamp?: string;
}

export interface PresenceUpdatePayload {
  userId: string;
  status: 'online' | 'away' | 'offline';
  metadata?: {
    currentActivity?: string;
    currentPath?: number;
  };
}

// ============================================
// Live Session Events
// ============================================

export interface SessionStartedPayload {
  sessionId: number;
  startedAt: string;
  config: {
    cardCount: number;
    timeLimit: number;
    allowHints: boolean;
  };
}

export interface SessionCardRevealedPayload {
  sessionId: number;
  cardIndex: number;
  flashcard: {
    id: number;
    question: string;
    answer: string;
    options?: string[];
  };
  timeLimit: number;
}

export interface SessionAnswerSubmittedPayload {
  sessionId: number;
  userId: string;
  flashcardId: number;
  isCorrect: boolean;
  points: number;
  responseTimeMs: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string | null;
  totalScore: number;
  rank: number;
  correctAnswers: number;
  averageResponseTime: number;
}

export interface SessionLeaderboardUpdatedPayload {
  sessionId: number;
  leaderboard: LeaderboardEntry[];
}

export interface SessionEndedPayload {
  sessionId: number;
  endedAt: string;
  finalLeaderboard: LeaderboardEntry[];
}

// ============================================
// Group Events
// ============================================

export interface GroupActivityPayload {
  groupId: number;
  userId: string;
  userName: string;
  activityType: 'card_mastered' | 'streak_extended' | 'path_completed';
  metadata?: Record<string, unknown>;
}

export interface GroupStreakUpdatedPayload {
  groupId: number;
  currentStreak: number;
  contributorsToday: string[];
  pendingMembers: string[];
}

// ============================================
// Combined Event Map
// ============================================

export interface ConnectionConfirmedPayload {
  socketId: string;
  userId: string;
  timestamp: string;
}

export interface ServerToClientEvents {
  // Connection
  'connection:confirmed': (payload: ConnectionConfirmedPayload) => void;

  // Presence
  'presence:user_joined': (payload: PresenceUserJoinedPayload) => void;
  'presence:user_left': (payload: PresenceUserLeftPayload) => void;
  'presence:update': (payload: PresenceUpdatePayload) => void;

  // Live Sessions
  'session:started': (payload: SessionStartedPayload) => void;
  'session:card_revealed': (payload: SessionCardRevealedPayload) => void;
  'session:answer_submitted': (payload: SessionAnswerSubmittedPayload) => void;
  'session:leaderboard_updated': (payload: SessionLeaderboardUpdatedPayload) => void;
  'session:ended': (payload: SessionEndedPayload) => void;

  // Groups
  'group:activity': (payload: GroupActivityPayload) => void;
  'group:streak_updated': (payload: GroupStreakUpdatedPayload) => void;

  // Typing
  'typing:user_started': (payload: TypingUserPayload) => void;
  'typing:user_stopped': (payload: TypingUserPayload) => void;
}

// ============================================
// Typing Events (for future chat features)
// ============================================

export interface TypingPayload {
  groupId?: number;
  sessionId?: number;
}

export interface TypingUserPayload {
  userId: string;
  userName?: string;
  groupId?: number;
  sessionId?: number;
}

export interface ClientToServerEvents {
  // Presence
  'presence:join': (payload: PresenceJoinPayload) => void;
  'presence:leave': (payload: PresenceLeavePayload) => void;
  'presence:update': (payload: Omit<PresenceUpdatePayload, 'userId'>) => void;

  // Typing
  'typing:start': (payload: TypingPayload) => void;
  'typing:stop': (payload: TypingPayload) => void;
}

// Type-safe Socket
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
