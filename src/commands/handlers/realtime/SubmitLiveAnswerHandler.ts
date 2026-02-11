/**
 * Submit Live Answer Handler
 *
 * Records a participant's answer during a live session and calculates points.
 * Points are based on correctness and response speed.
 */

import type { SubmitLiveAnswerCommand } from "@/commands/realtime/SubmitLiveAnswer.command";
import type { ICommandHandler } from "@/commands/types";
import type { SubmitLiveAnswerResult } from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import {
  liveSessions,
  liveSessionParticipants,
  liveSessionAnswers,
  flashcards,
  users,
} from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and, desc } from "drizzle-orm";
import { emitAnswerSubmitted, emitLeaderboardUpdated } from "@/lib/realtime/socket-server";

export class SubmitLiveAnswerHandler
  implements ICommandHandler<SubmitLiveAnswerCommand, SubmitLiveAnswerResult>
{
  async execute(command: SubmitLiveAnswerCommand): Promise<SubmitLiveAnswerResult> {
    try {
      // 1. Verify session exists and is active
      const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, command.sessionId),
      });

      if (!session) {
        throw new DomainError("Live session not found", "SESSION_NOT_FOUND");
      }

      if (session.status !== "active") {
        throw new DomainError(
          "Session is not active",
          "SESSION_NOT_ACTIVE"
        );
      }

      // 2. Verify user is a participant
      const participant = await db.query.liveSessionParticipants.findFirst({
        where: and(
          eq(liveSessionParticipants.sessionId, command.sessionId),
          eq(liveSessionParticipants.userId, command.userId)
        ),
      });

      if (!participant) {
        throw new DomainError(
          "You are not a participant in this session",
          "NOT_PARTICIPANT"
        );
      }

      // 3. Get flashcard to check correctness
      const flashcard = await db.query.flashcards.findFirst({
        where: eq(flashcards.id, command.flashcardId),
      });

      if (!flashcard) {
        throw new DomainError("Flashcard not found", "FLASHCARD_NOT_FOUND");
      }

      // 4. Check if answer is correct (case-insensitive comparison)
      const isCorrect =
        command.answer.trim().toLowerCase() ===
        flashcard.answer.trim().toLowerCase();

      // 5. Calculate points
      const config = session.config as { timeLimit: number };
      const timeLimit = config.timeLimit * 1000; // Convert to ms
      const points = this.calculatePoints(
        isCorrect,
        command.responseTimeMs,
        timeLimit
      );

      // 6. Check if user already answered this card
      const existingAnswer = await db.query.liveSessionAnswers.findFirst({
        where: and(
          eq(liveSessionAnswers.sessionId, command.sessionId),
          eq(liveSessionAnswers.userId, command.userId),
          eq(liveSessionAnswers.flashcardId, command.flashcardId)
        ),
      });

      if (existingAnswer) {
        throw new DomainError(
          "You have already answered this question",
          "ALREADY_ANSWERED"
        );
      }

      // 7. Record the answer
      const [answer] = await db
        .insert(liveSessionAnswers)
        .values({
          sessionId: command.sessionId,
          userId: command.userId,
          flashcardId: command.flashcardId,
          answer: command.answer,
          isCorrect,
          responseTimeMs: command.responseTimeMs,
          pointsEarned: points,
          cardIndex: session.currentCardIndex,
        })
        .returning();

      // 8. Update participant's total score
      const newTotalScore = participant.totalScore + points;

      await db
        .update(liveSessionParticipants)
        .set({
          totalScore: newTotalScore,
          correctAnswers: isCorrect
            ? (participant.correctAnswers || 0) + 1
            : participant.correctAnswers,
          totalAnswers: (participant.totalAnswers || 0) + 1,
        })
        .where(
          and(
            eq(liveSessionParticipants.sessionId, command.sessionId),
            eq(liveSessionParticipants.userId, command.userId)
          )
        );

      // 9. Calculate new rank
      const allParticipants = await db.query.liveSessionParticipants.findMany({
        where: eq(liveSessionParticipants.sessionId, command.sessionId),
        orderBy: [desc(liveSessionParticipants.totalScore)],
      });

      const newRank =
        allParticipants.findIndex((p) => p.userId === command.userId) + 1;

      // Update rank
      await db
        .update(liveSessionParticipants)
        .set({ rank: newRank })
        .where(
          and(
            eq(liveSessionParticipants.sessionId, command.sessionId),
            eq(liveSessionParticipants.userId, command.userId)
          )
        );

      // 10. Broadcast answer submitted and leaderboard updated events via Socket.io
      try {
        // Emit answer submitted event
        emitAnswerSubmitted(
          command.sessionId,
          command.userId,
          command.flashcardId,
          isCorrect,
          points,
          command.responseTimeMs
        );

        // Fetch full leaderboard with user details for emission
        const leaderboardData = await db
          .select({
            userId: liveSessionParticipants.userId,
            userName: users.name,
            userAvatar: users.image,
            totalScore: liveSessionParticipants.totalScore,
            rank: liveSessionParticipants.rank,
            correctAnswers: liveSessionParticipants.correctAnswers,
            averageResponseTime: liveSessionParticipants.averageResponseTime,
          })
          .from(liveSessionParticipants)
          .leftJoin(users, eq(liveSessionParticipants.userId, users.id))
          .where(eq(liveSessionParticipants.sessionId, command.sessionId))
          .orderBy(desc(liveSessionParticipants.totalScore));

        // Emit leaderboard updated event
        emitLeaderboardUpdated(
          command.sessionId,
          leaderboardData.map((p) => ({
            userId: p.userId,
            userName: p.userName || "Anonymous",
            userAvatar: p.userAvatar,
            totalScore: p.totalScore || 0,
            rank: p.rank || 0,
            correctAnswers: p.correctAnswers || 0,
            averageResponseTime: p.averageResponseTime || 0,
          }))
        );
      } catch (socketError) {
        console.error("Failed to broadcast answer submission:", socketError);
      }

      return {
        success: true,
        data: {
          answerId: answer.id,
          isCorrect,
          pointsEarned: points,
          newTotalScore,
          newRank,
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("SubmitLiveAnswerHandler error:", error);
      return {
        success: false,
        error: "Failed to submit answer",
      };
    }
  }

  /**
   * Calculate points based on correctness and speed
   *
   * Scoring formula:
   * - Base points: 10 for correct, 0 for incorrect
   * - Speed bonus: up to 10 points based on how fast the answer was submitted
   * - Total possible: 20 points per question
   */
  private calculatePoints(
    isCorrect: boolean,
    responseTimeMs: number,
    timeLimitMs: number
  ): number {
    if (!isCorrect) {
      return 0;
    }

    // Base points for correct answer
    let points = 10;

    // Calculate speed bonus (up to 10 points)
    // Faster responses get more points
    const speedRatio = 1 - responseTimeMs / timeLimitMs;
    const speedBonus = Math.max(0, Math.min(10, Math.floor(speedRatio * 10)));

    points += speedBonus;

    return points;
  }
}
