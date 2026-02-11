/**
 * Quiz Utility Functions
 *
 * Utilities for quiz sessions including multiple-choice generation
 */

import { db } from "@/infrastructure/database/db";
import { flashcards } from "@/infrastructure/database/schema";
import { eq, ne, and, sql } from "drizzle-orm";

/**
 * Generate multiple-choice options for a flashcard
 *
 * @param flashcardId - ID of the flashcard to generate options for
 * @param categoryId - Optional category ID to filter wrong answers from same category
 * @returns Array of 4 options including the correct answer, shuffled
 */
export async function generateMultipleChoiceOptions(
  flashcardId: number,
  categoryId?: number
): Promise<string[]> {
  try {
    // Get the correct flashcard
    const correctCard = await db.query.flashcards.findFirst({
      where: eq(flashcards.id, flashcardId),
    });

    if (!correctCard) {
      throw new Error(`Flashcard ${flashcardId} not found`);
    }

    const correctAnswer = correctCard.answer;

    // Get 3 wrong answers from same category or random if no category
    let wrongAnswers;
    if (categoryId) {
      wrongAnswers = await db
        .select({ answer: flashcards.answer })
        .from(flashcards)
        .where(
          and(
            eq(flashcards.categoryId, categoryId),
            ne(flashcards.id, flashcardId)
          )
        )
        .orderBy(sql`RANDOM()`)
        .limit(3);
    } else {
      wrongAnswers = await db
        .select({ answer: flashcards.answer })
        .from(flashcards)
        .where(ne(flashcards.id, flashcardId))
        .orderBy(sql`RANDOM()`)
        .limit(3);
    }

    // If we don't have enough wrong answers, generate placeholders
    const wrongAnswerTexts = wrongAnswers.map((w) => w.answer);
    while (wrongAnswerTexts.length < 3) {
      wrongAnswerTexts.push(`Option ${String.fromCharCode(66 + wrongAnswerTexts.length)}`);
    }

    // Combine correct answer with wrong answers
    const allOptions = [correctAnswer, ...wrongAnswerTexts];

    // Shuffle the options using Fisher-Yates algorithm
    const shuffled = shuffleArray(allOptions);

    return shuffled;
  } catch (error) {
    console.error("Error generating multiple-choice options:", error);
    // Fallback to generic options
    return ["Option A", "Option B", "Option C", "Option D"];
  }
}

/**
 * Generate multiple-choice options for multiple flashcards in batch
 *
 * @param flashcardIds - Array of flashcard IDs
 * @param categoryId - Optional category ID for wrong answers
 * @returns Map of flashcard ID to options array
 */
export async function generateBatchMultipleChoiceOptions(
  flashcardIds: number[],
  categoryId?: number
): Promise<Map<number, string[]>> {
  const optionsMap = new Map<number, string[]>();

  // Generate options for each flashcard
  await Promise.all(
    flashcardIds.map(async (id) => {
      const options = await generateMultipleChoiceOptions(id, categoryId);
      optionsMap.set(id, options);
    })
  );

  return optionsMap;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate points for an answer based on correctness and speed
 *
 * @param isCorrect - Whether the answer is correct
 * @param responseTimeMs - Time taken to answer in milliseconds
 * @param timeLimitMs - Time limit for the question in milliseconds
 * @returns Points earned and speed bonus breakdown
 */
export function calculateQuizPoints(
  isCorrect: boolean,
  responseTimeMs: number,
  timeLimitMs: number
): {
  totalPoints: number;
  basePoints: number;
  speedBonus: number;
} {
  if (!isCorrect) {
    return {
      totalPoints: 0,
      basePoints: 0,
      speedBonus: 0,
    };
  }

  // Base points for correct answer
  const basePoints = 10;

  // Calculate speed bonus (up to 10 points)
  // Faster responses get more points
  const speedRatio = Math.max(0, 1 - responseTimeMs / timeLimitMs);
  const speedBonus = Math.floor(speedRatio * 10);

  return {
    totalPoints: basePoints + speedBonus,
    basePoints,
    speedBonus,
  };
}

/**
 * Check if all participants have answered the current question
 *
 * @param sessionId - ID of the live session
 * @param currentCardIndex - Index of the current card
 * @returns Boolean indicating if all participants have answered
 */
export async function haveAllParticipantsAnswered(
  sessionId: number,
  currentCardIndex: number
): Promise<boolean> {
  try {
    const { liveSessionParticipants, liveSessionAnswers } = await import(
      "@/infrastructure/database/schema"
    );

    // Get total participant count
    const participants = await db
      .select({ userId: liveSessionParticipants.userId })
      .from(liveSessionParticipants)
      .where(eq(liveSessionParticipants.sessionId, sessionId));

    const totalParticipants = participants.length;

    if (totalParticipants === 0) {
      return true; // No participants, consider as "all answered"
    }

    // Count answers for current card
    const answers = await db
      .select({ userId: liveSessionAnswers.userId })
      .from(liveSessionAnswers)
      .where(
        and(
          eq(liveSessionAnswers.sessionId, sessionId),
          eq(liveSessionAnswers.cardIndex, currentCardIndex)
        )
      );

    return answers.length >= totalParticipants;
  } catch (error) {
    console.error("Error checking if all participants answered:", error);
    return false;
  }
}

/**
 * Calculate average response time for a participant
 *
 * @param sessionId - ID of the live session
 * @param userId - ID of the user
 * @returns Average response time in milliseconds
 */
export async function calculateAverageResponseTime(
  sessionId: number,
  userId: string
): Promise<number> {
  try {
    const { liveSessionAnswers } = await import("@/infrastructure/database/schema");

    const answers = await db
      .select({ responseTimeMs: liveSessionAnswers.responseTimeMs })
      .from(liveSessionAnswers)
      .where(
        and(
          eq(liveSessionAnswers.sessionId, sessionId),
          eq(liveSessionAnswers.userId, userId)
        )
      );

    if (answers.length === 0) {
      return 0;
    }

    const total = answers.reduce((sum, a) => sum + a.responseTimeMs, 0);
    return Math.round(total / answers.length);
  } catch (error) {
    console.error("Error calculating average response time:", error);
    return 0;
  }
}
