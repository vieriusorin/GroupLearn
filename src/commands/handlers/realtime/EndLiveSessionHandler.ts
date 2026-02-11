/**
 * End Live Session Handler
 *
 * Ends a live session (host only).
 * Finalizes scores, calculates final rankings, and awards XP to participants.
 */

import type { EndLiveSessionCommand } from "@/commands/realtime/EndLiveSession.command";
import type { ICommandHandler } from "@/commands/types";
import type { EndLiveSessionResult, LeaderboardEntry } from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import {
  liveSessions,
  liveSessionParticipants,
  liveSessionAnswers,
  userProgress,
  xpTransactions,
} from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and, desc, sql } from "drizzle-orm";
import { emitSessionEnded } from "@/lib/realtime/socket-server";

export class EndLiveSessionHandler
  implements ICommandHandler<EndLiveSessionCommand, EndLiveSessionResult>
{
  async execute(command: EndLiveSessionCommand): Promise<EndLiveSessionResult> {
    try {
      // 1. Get session and verify it exists
      const [session] = await db
        .select()
        .from(liveSessions)
        .where(eq(liveSessions.id, command.sessionId))
        .limit(1);

      if (!session) {
        throw new DomainError("Live session not found", "SESSION_NOT_FOUND");
      }

      // 2. Verify user is the host
      if (session.hostId !== command.userId) {
        throw new DomainError(
          "Only the session host can end the session",
          "UNAUTHORIZED"
        );
      }

      // 3. Verify session is active
      if (session.status !== "active") {
        throw new DomainError(
          `Cannot end session - current status is ${session.status}`,
          "INVALID_SESSION_STATUS"
        );
      }

      // 4. Get all participants with stats
      const participants = await db
        .select({
          userId: liveSessionParticipants.userId,
          userName: db.schema.users.name,
          userImage: db.schema.users.image,
          totalScore: liveSessionParticipants.totalScore,
          correctAnswers: liveSessionParticipants.correctAnswers,
          totalAnswers: liveSessionParticipants.totalAnswers,
        })
        .from(liveSessionParticipants)
        .innerJoin(
          db.schema.users,
          eq(liveSessionParticipants.userId, db.schema.users.id)
        )
        .where(eq(liveSessionParticipants.sessionId, command.sessionId))
        .orderBy(desc(liveSessionParticipants.totalScore));

      // 5. Calculate average response time for each participant
      const responseTimeStats = await db
        .select({
          userId: liveSessionAnswers.userId,
          avgResponseTime: sql<number>`AVG(${liveSessionAnswers.responseTimeMs})`,
        })
        .from(liveSessionAnswers)
        .where(eq(liveSessionAnswers.sessionId, command.sessionId))
        .groupBy(liveSessionAnswers.userId);

      // 6. Build final leaderboard with ranks
      const finalLeaderboard: LeaderboardEntry[] = participants.map((p, index) => {
        const stats = responseTimeStats.find((s) => s.userId === p.userId);

        return {
          userId: p.userId,
          userName: p.userName || "Unknown",
          userImage: p.userImage,
          totalScore: p.totalScore,
          rank: index + 1,
          correctAnswers: p.correctAnswers || 0,
          totalAnswers: p.totalAnswers || 0,
          averageResponseTime: stats?.avgResponseTime || 0,
        };
      });

      // 7. Update final ranks in database
      for (const entry of finalLeaderboard) {
        await db
          .update(liveSessionParticipants)
          .set({ rank: entry.rank })
          .where(
            and(
              eq(liveSessionParticipants.sessionId, command.sessionId),
              eq(liveSessionParticipants.userId, entry.userId)
            )
          );
      }

      // 8. Award XP based on performance
      const xpAwards: Record<string, number> = {};

      for (const entry of finalLeaderboard) {
        const xpAmount = this.calculateXPAward(
          entry.rank,
          entry.totalScore,
          entry.correctAnswers,
          participants.length
        );

        if (xpAmount > 0) {
          xpAwards[entry.userId] = xpAmount;

          // Update user progress
          await db
            .update(userProgress)
            .set({
              totalXP: sql`${userProgress.totalXP} + ${xpAmount}`,
            })
            .where(eq(userProgress.userId, entry.userId));

          // Create XP transaction record
          await db.insert(xpTransactions).values({
            userId: entry.userId,
            amount: xpAmount,
            source: "live_quiz",
            description: `Earned from Blitz Quiz (Rank #${entry.rank})`,
            metadata: {
              sessionId: command.sessionId,
              rank: entry.rank,
              score: entry.totalScore,
            },
          });
        }
      }

      // 9. Update session status to completed
      const [updatedSession] = await db
        .update(liveSessions)
        .set({
          status: "completed",
          endedAt: new Date(),
        })
        .where(eq(liveSessions.id, command.sessionId))
        .returning();

      // 10. Broadcast session ended event via Socket.io
      try {
        emitSessionEnded(
          command.sessionId,
          updatedSession.endedAt!.toISOString(),
          finalLeaderboard.map((entry) => ({
            userId: entry.userId,
            userName: entry.userName,
            userAvatar: entry.userImage,
            totalScore: entry.totalScore,
            rank: entry.rank,
            correctAnswers: entry.correctAnswers,
            averageResponseTime: entry.averageResponseTime,
          }))
        );
      } catch (socketError) {
        console.error("Failed to broadcast session end:", socketError);
      }

      return {
        success: true,
        data: {
          sessionId: updatedSession.id,
          status: updatedSession.status,
          endedAt: updatedSession.endedAt!.toISOString(),
          finalLeaderboard,
          xpAwarded: xpAwards,
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("EndLiveSessionHandler error:", error);
      return {
        success: false,
        error: "Failed to end live session",
      };
    }
  }

  /**
   * Calculate XP award based on performance
   *
   * XP Formula:
   * - 1st place: 50 XP + 50% of score
   * - 2nd place: 30 XP + 30% of score
   * - 3rd place: 20 XP + 20% of score
   * - 4th-10th: 10 XP + 10% of score
   * - Participation bonus: 5 XP for completing at least 50% of questions
   */
  private calculateXPAward(
    rank: number,
    totalScore: number,
    correctAnswers: number,
    totalParticipants: number
  ): number {
    let xp = 0;

    // Base XP by rank
    if (rank === 1) {
      xp = 50 + Math.floor(totalScore * 0.5);
    } else if (rank === 2) {
      xp = 30 + Math.floor(totalScore * 0.3);
    } else if (rank === 3) {
      xp = 20 + Math.floor(totalScore * 0.2);
    } else if (rank <= 10) {
      xp = 10 + Math.floor(totalScore * 0.1);
    } else {
      xp = 5 + Math.floor(totalScore * 0.05);
    }

    // Participation bonus (answered at least one question)
    if (correctAnswers > 0) {
      xp += 5;
    }

    return xp;
  }
}
