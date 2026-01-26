"use server";

/**
 * Live Session Server Actions
 *
 * Server-side actions for managing live quiz sessions.
 * These wrap the CQRS command and query handlers for use in React Server Components.
 */

import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

// Command Handlers
import {
  CreateLiveSessionHandler,
  JoinLiveSessionHandler,
  StartLiveSessionHandler,
  SubmitLiveAnswerHandler,
  EndLiveSessionHandler,
} from "@/commands/handlers/realtime";

// Query Handlers
import {
  GetActiveLiveSessionsHandler,
  GetLiveSessionLeaderboardHandler,
  GetLiveSessionDetailHandler,
} from "@/queries/handlers/realtime";

// Commands
import {
  createLiveSessionCommand,
  joinLiveSessionCommand,
  startLiveSessionCommand,
  submitLiveAnswerCommand,
  endLiveSessionCommand,
} from "@/commands/realtime";

// Queries
import {
  getActiveLiveSessionsQuery,
  getLiveSessionLeaderboardQuery,
  getLiveSessionDetailQuery,
} from "@/queries/realtime";

// Repository implementations (to be injected)
// For now, handlers will use db directly

// ============================================
// Command Actions
// ============================================

export async function createLiveSession(
  groupId: number,
  sessionType: "blitz_quiz" | "study_room" | "peer_review",
  config: {
    cardCount: number;
    timeLimit: number;
    allowHints: boolean;
  },
  categoryId?: number
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to create a session",
    };
  }

  const command = createLiveSessionCommand(
    session.user.id,
    groupId,
    sessionType,
    config,
    categoryId
  );

  const handler = new CreateLiveSessionHandler();
  return await handler.execute(command);
}

export async function joinLiveSession(sessionId: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to join a session",
    };
  }

  const command = joinLiveSessionCommand(session.user.id, sessionId);

  const handler = new JoinLiveSessionHandler();
  return await handler.execute(command);
}

export async function startLiveSession(
  sessionId: number,
  flashcardIds?: number[]
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to start a session",
    };
  }

  const command = startLiveSessionCommand(
    session.user.id,
    sessionId,
    flashcardIds
  );

  const handler = new StartLiveSessionHandler();
  return await handler.execute(command);
}

export async function submitLiveAnswer(
  sessionId: number,
  flashcardId: number,
  answer: string,
  responseTimeMs: number
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to submit an answer",
    };
  }

  const command = submitLiveAnswerCommand(
    session.user.id,
    sessionId,
    flashcardId,
    answer,
    responseTimeMs
  );

  const handler = new SubmitLiveAnswerHandler();
  return await handler.execute(command);
}

export async function endLiveSession(sessionId: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to end a session",
    };
  }

  const command = endLiveSessionCommand(session.user.id, sessionId);

  const handler = new EndLiveSessionHandler();
  return await handler.execute(command);
}

// ============================================
// Query Actions
// ============================================

export async function getActiveLiveSessions(groupId: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to view sessions",
    };
  }

  const query = getActiveLiveSessionsQuery(groupId, session.user.id);

  const handler = new GetActiveLiveSessionsHandler();
  return await handler.execute(query);
}

export async function getLiveSessionLeaderboard(sessionId: number) {
  // Leaderboard is public to all participants, no auth needed
  // But in production, you might want to verify the user is a participant

  const query = getLiveSessionLeaderboardQuery(sessionId);

  const handler = new GetLiveSessionLeaderboardHandler();
  return await handler.execute(query);
}

export async function getLiveSessionDetail(sessionId: number) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to view session details",
    };
  }

  const query = getLiveSessionDetailQuery(sessionId, session.user.id);

  const handler = new GetLiveSessionDetailHandler();
  return await handler.execute(query);
}
