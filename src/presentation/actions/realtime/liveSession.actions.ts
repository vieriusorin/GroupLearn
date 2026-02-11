"use server";

/**
 * Live Session Server Actions
 *
 * Server-side actions for managing live quiz sessions.
 * These wrap the CQRS command and query handlers for use in React Server Components.
 */

import { auth } from "@/lib/auth/auth";

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
  const session = await auth();

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
  const session = await auth();

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
  const session = await auth();

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
  const session = await auth();

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
  const session = await auth();

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
  const session = await auth();

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
  const session = await auth();

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

// ============================================
// Additional Query Actions for Quiz Flow
// ============================================

/**
 * Get current participant state in a session
 */
export async function getLiveSessionParticipantState(sessionId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to view participant state",
    };
  }

  // Query participant data
  const { db } = await import("@/infrastructure/database/db");
  const { liveSessionParticipants } = await import("@/infrastructure/database/schema/realtime.schema");
  const { eq, and } = await import("drizzle-orm");

  try {
    const [participant] = await db
      .select()
      .from(liveSessionParticipants)
      .where(
        and(
          eq(liveSessionParticipants.sessionId, sessionId),
          eq(liveSessionParticipants.userId, session.user.id)
        )
      )
      .limit(1);

    if (!participant) {
      return {
        success: false,
        error: "You are not a participant in this session",
      };
    }

    return {
      success: true,
      data: {
        userId: participant.userId,
        score: participant.totalScore,
        rank: participant.rank || 1,
        answeredCards: participant.totalAnswers,
        correctAnswers: participant.correctAnswers,
        averageResponseTime: participant.averageResponseTime,
      },
    };
  } catch (error) {
    console.error("Error fetching participant state:", error);
    return {
      success: false,
      error: "Failed to fetch participant state",
    };
  }
}

/**
 * Get current flashcard for active session
 */
export async function getCurrentSessionCard(sessionId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to view cards",
    };
  }

  const { db } = await import("@/infrastructure/database/db");
  const { liveSessions } = await import("@/infrastructure/database/schema/realtime.schema");
  const { flashcards } = await import("@/infrastructure/database/schema");
  const { eq } = await import("drizzle-orm");
  const { generateMultipleChoiceOptions } = await import("@/lib/realtime/quiz-utils");

  try {
    // Get session to find current card index and selected flashcards
    const [liveSession] = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, sessionId))
      .limit(1);

    if (!liveSession) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    if (liveSession.status !== "active") {
      return {
        success: false,
        error: "Session is not active",
      };
    }

    const selectedFlashcards = liveSession.selectedFlashcards as number[] || [];
    const currentIndex = liveSession.currentCardIndex;

    if (currentIndex >= selectedFlashcards.length) {
      return {
        success: false,
        error: "No more cards available",
      };
    }

    const flashcardId = selectedFlashcards[currentIndex];

    // Fetch the flashcard
    const [flashcard] = await db
      .select()
      .from(flashcards)
      .where(eq(flashcards.id, flashcardId))
      .limit(1);

    if (!flashcard) {
      return {
        success: false,
        error: "Flashcard not found",
      };
    }

    // Generate multiple-choice options
    const options = await generateMultipleChoiceOptions(
      flashcard.id,
      liveSession.categoryId || undefined
    );

    const config = liveSession.config as any;
    const timeLimit = config?.timeLimit || 30;

    return {
      success: true,
      data: {
        id: flashcard.id,
        front: flashcard.question, // Map question to front for UI
        back: flashcard.answer, // Map answer to back for UI
        options,
        correctAnswer: flashcard.answer,
        cardNumber: currentIndex + 1,
        totalCards: selectedFlashcards.length,
        timeLimit,
      },
    };
  } catch (error) {
    console.error("Error fetching current card:", error);
    return {
      success: false,
      error: "Failed to fetch current card",
    };
  }
}

/**
 * Get session results for completed session
 */
export async function getLiveSessionResults(sessionId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      success: false,
      error: "You must be logged in to view results",
    };
  }

  const { db } = await import("@/infrastructure/database/db");
  const {
    liveSessions,
    liveSessionParticipants,
    liveSessionAnswers,
  } = await import("@/infrastructure/database/schema/realtime.schema");
  const { users } = await import("@/infrastructure/database/schema");
  const { eq, and, desc } = await import("drizzle-orm");

  try {
    // Get session details
    const [liveSession] = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, sessionId))
      .limit(1);

    if (!liveSession) {
      return {
        success: false,
        error: "Session not found",
      };
    }

    // Get all participants with user details
    const participantsData = await db
      .select({
        userId: liveSessionParticipants.userId,
        userName: users.name,
        totalScore: liveSessionParticipants.totalScore,
        correctAnswers: liveSessionParticipants.correctAnswers,
        totalAnswers: liveSessionParticipants.totalAnswers,
        averageResponseTime: liveSessionParticipants.averageResponseTime,
        rank: liveSessionParticipants.rank,
      })
      .from(liveSessionParticipants)
      .leftJoin(users, eq(liveSessionParticipants.userId, users.id))
      .where(eq(liveSessionParticipants.sessionId, sessionId))
      .orderBy(desc(liveSessionParticipants.totalScore));

    // Calculate XP earned based on rank
    const participantsWithXP = participantsData.map((p, index) => {
      const rank = index + 1;
      let xpBonus = 0;
      if (rank === 1) xpBonus = 100;
      else if (rank === 2) xpBonus = 50;
      else if (rank === 3) xpBonus = 25;

      // Base XP from points (1 point = 1 XP) + rank bonus
      const xpEarned = (p.totalScore || 0) + xpBonus;

      return {
        userId: p.userId,
        userName: p.userName || "Anonymous",
        score: p.totalScore || 0,
        rank,
        answeredCards: p.totalAnswers || 0,
        correctAnswers: p.correctAnswers || 0,
        xpEarned,
      };
    });

    // Get personal stats for current user
    const currentUserAnswers = await db
      .select()
      .from(liveSessionAnswers)
      .where(
        and(
          eq(liveSessionAnswers.sessionId, sessionId),
          eq(liveSessionAnswers.userId, session.user.id)
        )
      );

    const totalAnswers = currentUserAnswers.length;
    const correctAnswers = currentUserAnswers.filter((a) => a.isCorrect).length;
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    const responseTimes = currentUserAnswers.map((a) => a.responseTimeMs);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;
    const fastestAnswer = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const slowestAnswer = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    // Calculate longest correct streak
    let currentStreak = 0;
    let maxStreak = 0;
    for (const answer of currentUserAnswers) {
      if (answer.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const config = liveSession.config as any;
    const totalCards = (liveSession.selectedFlashcards as number[] || []).length;

    return {
      success: true,
      data: {
        participants: participantsWithXP,
        personalStats: {
          accuracy,
          avgResponseTime,
          fastestAnswer,
          slowestAnswer,
          streak: maxStreak,
        },
        totalCards,
        sessionType: liveSession.sessionType,
      },
    };
  } catch (error) {
    console.error("Error fetching session results:", error);
    return {
      success: false,
      error: "Failed to fetch session results",
    };
  }
}
