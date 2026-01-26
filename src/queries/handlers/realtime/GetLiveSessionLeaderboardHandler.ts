/**
 * Get Live Session Leaderboard Handler
 *
 * Retrieves the current leaderboard for an active or completed live session.
 * Includes rankings, scores, accuracy, and response time statistics.
 */

import type { GetLiveSessionLeaderboardQuery } from "@/queries/realtime/GetLiveSessionLeaderboard.query";
import type { IQueryHandler } from "@/commands/types";
import type {
  GetLiveSessionLeaderboardResult,
  LeaderboardEntry,
  LiveSessionStats,
} from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import { liveSessions, liveSessionParticipants, liveSessionAnswers } from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, desc, sql } from "drizzle-orm";

export class GetLiveSessionLeaderboardHandler
  implements IQueryHandler<GetLiveSessionLeaderboardQuery, GetLiveSessionLeaderboardResult>
{
  async execute(
    query: GetLiveSessionLeaderboardQuery
  ): Promise<GetLiveSessionLeaderboardResult> {
    try {
      // 1. Verify session exists
      const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, query.sessionId),
      });

      if (!session) {
        throw new DomainError("Live session not found", "SESSION_NOT_FOUND");
      }

      // 2. Get all participants with user info, ordered by score
      const participants = await db
        .select({
          userId: liveSessionParticipants.userId,
          userName: db.schema.users.name,
          userImage: db.schema.users.image,
          totalScore: liveSessionParticipants.totalScore,
          correctAnswers: liveSessionParticipants.correctAnswers,
          totalAnswers: liveSessionParticipants.totalAnswers,
          rank: liveSessionParticipants.rank,
        })
        .from(liveSessionParticipants)
        .innerJoin(
          db.schema.users,
          eq(liveSessionParticipants.userId, db.schema.users.id)
        )
        .where(eq(liveSessionParticipants.sessionId, query.sessionId))
        .orderBy(desc(liveSessionParticipants.totalScore));

      // 3. Get answer statistics for each participant
      const answerStats = await db
        .select({
          userId: liveSessionAnswers.userId,
          avgResponseTime: sql<number>`AVG(${liveSessionAnswers.responseTimeMs})`,
          correctCount: sql<number>`COUNT(CASE WHEN ${liveSessionAnswers.isCorrect} THEN 1 END)::int`,
          totalCount: sql<number>`COUNT(*)::int`,
        })
        .from(liveSessionAnswers)
        .where(eq(liveSessionAnswers.sessionId, query.sessionId))
        .groupBy(liveSessionAnswers.userId);

      // 4. Build leaderboard entries
      const leaderboard: LeaderboardEntry[] = participants.map((p, index) => {
        const stats = answerStats.find((s) => s.userId === p.userId);

        return {
          userId: p.userId,
          userName: p.userName || "Unknown",
          userImage: p.userImage,
          totalScore: p.totalScore,
          rank: p.rank || index + 1, // Use stored rank or calculate from order
          correctAnswers: stats?.correctCount || p.correctAnswers || 0,
          totalAnswers: stats?.totalCount || p.totalAnswers || 0,
          averageResponseTime: stats?.avgResponseTime || 0,
        };
      });

      // 5. Calculate overall session statistics
      const totalAnswers = await db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(liveSessionAnswers)
        .where(eq(liveSessionAnswers.sessionId, query.sessionId));

      const avgScoreResult = await db
        .select({
          avg: sql<number>`AVG(${liveSessionParticipants.totalScore})`,
        })
        .from(liveSessionParticipants)
        .where(eq(liveSessionParticipants.sessionId, query.sessionId));

      const fastestResponseResult = await db
        .select({
          min: sql<number>`MIN(${liveSessionAnswers.responseTimeMs})`,
        })
        .from(liveSessionAnswers)
        .where(eq(liveSessionAnswers.sessionId, query.sessionId));

      const stats: LiveSessionStats = {
        totalParticipants: participants.length,
        totalAnswers: totalAnswers[0]?.count || 0,
        averageScore: avgScoreResult[0]?.avg || 0,
        fastestResponseTime: fastestResponseResult[0]?.min || 0,
        currentCardIndex: session.currentCardIndex,
        totalCards: (session.selectedFlashcards as number[] | null)?.length || 0,
      };

      return {
        success: true,
        data: {
          leaderboard,
          stats,
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("GetLiveSessionLeaderboardHandler error:", error);
      return {
        success: false,
        error: "Failed to get leaderboard",
      };
    }
  }
}
