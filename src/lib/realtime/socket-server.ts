/**
 * Socket.io Server Utility
 *
 * Server-side utility for emitting Socket.io events from command handlers.
 * This provides a singleton accessor to the Socket.io server instance.
 */

import type { Server as SocketIOServer } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket-types";

// Singleton Socket.io server instance
let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

/**
 * Set the Socket.io server instance
 * Called once during server initialization
 */
export function setSocketIOServer(
  server: SocketIOServer<ClientToServerEvents, ServerToClientEvents>
): void {
  io = server;
  console.log("[Socket.io Server] Instance registered");
}

/**
 * Get the Socket.io server instance
 * Returns null if server hasn't been initialized yet
 */
export function getSocketIOServer(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io;
}

/**
 * Check if Socket.io server is initialized
 */
export function isSocketIOInitialized(): boolean {
  return io !== null;
}

/**
 * Emit session started event to all participants
 */
export function emitSessionStarted(sessionId: number, startedAt: string, config: {
  cardCount: number;
  timeLimit: number;
  allowHints: boolean;
}): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit session:started - server not initialized");
    return;
  }

  io.to(`session:${sessionId}`).emit("session:started", {
    sessionId,
    startedAt,
    config,
  });

  console.log(`[Socket.io Server] Emitted session:started for session ${sessionId}`);
}

/**
 * Emit card revealed event to all participants
 */
export function emitCardRevealed(
  sessionId: number,
  cardIndex: number,
  flashcard: {
    id: number;
    question: string;
    answer: string;
    options?: string[];
  },
  timeLimit: number
): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit session:card_revealed - server not initialized");
    return;
  }

  io.to(`session:${sessionId}`).emit("session:card_revealed", {
    sessionId,
    cardIndex,
    flashcard,
    timeLimit,
  });

  console.log(`[Socket.io Server] Emitted session:card_revealed for session ${sessionId}, card ${cardIndex}`);
}

/**
 * Emit answer submitted event to all participants
 */
export function emitAnswerSubmitted(
  sessionId: number,
  userId: string,
  flashcardId: number,
  isCorrect: boolean,
  points: number,
  responseTimeMs: number
): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit session:answer_submitted - server not initialized");
    return;
  }

  io.to(`session:${sessionId}`).emit("session:answer_submitted", {
    sessionId,
    userId,
    flashcardId,
    isCorrect,
    points,
    responseTimeMs,
  });

  console.log(`[Socket.io Server] Emitted session:answer_submitted for session ${sessionId}, user ${userId}`);
}

/**
 * Emit leaderboard updated event to all participants
 */
export function emitLeaderboardUpdated(
  sessionId: number,
  leaderboard: Array<{
    userId: string;
    userName: string;
    userAvatar: string | null;
    totalScore: number;
    rank: number;
    correctAnswers: number;
    averageResponseTime: number;
  }>
): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit session:leaderboard_updated - server not initialized");
    return;
  }

  io.to(`session:${sessionId}`).emit("session:leaderboard_updated", {
    sessionId,
    leaderboard,
  });

  console.log(`[Socket.io Server] Emitted session:leaderboard_updated for session ${sessionId}, ${leaderboard.length} participants`);
}

/**
 * Emit session ended event to all participants
 */
export function emitSessionEnded(
  sessionId: number,
  endedAt: string,
  finalLeaderboard: Array<{
    userId: string;
    userName: string;
    userAvatar: string | null;
    totalScore: number;
    rank: number;
    correctAnswers: number;
    averageResponseTime: number;
  }>
): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit session:ended - server not initialized");
    return;
  }

  io.to(`session:${sessionId}`).emit("session:ended", {
    sessionId,
    endedAt,
    finalLeaderboard,
  });

  console.log(`[Socket.io Server] Emitted session:ended for session ${sessionId}`);
}

/**
 * Emit group activity event
 */
export function emitGroupActivity(
  groupId: number,
  userId: string,
  userName: string,
  activityType: "card_mastered" | "streak_extended" | "path_completed",
  metadata?: Record<string, unknown>
): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit group:activity - server not initialized");
    return;
  }

  io.to(`group:${groupId}`).emit("group:activity", {
    groupId,
    userId,
    userName,
    activityType,
    metadata,
  });

  console.log(`[Socket.io Server] Emitted group:activity for group ${groupId}, user ${userId}`);
}

/**
 * Emit group streak updated event
 */
export function emitGroupStreakUpdated(
  groupId: number,
  currentStreak: number,
  contributorsToday: string[],
  pendingMembers: string[]
): void {
  if (!io) {
    console.warn("[Socket.io Server] Cannot emit group:streak_updated - server not initialized");
    return;
  }

  io.to(`group:${groupId}`).emit("group:streak_updated", {
    groupId,
    currentStreak,
    contributorsToday,
    pendingMembers,
  });

  console.log(`[Socket.io Server] Emitted group:streak_updated for group ${groupId}, streak: ${currentStreak}`);
}
