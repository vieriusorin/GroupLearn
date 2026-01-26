/**
 * Get Active Live Sessions Handler
 *
 * Retrieves all active (waiting or in-progress) live sessions for a group.
 * Users must be members of the group to query sessions.
 */

import type { GetActiveLiveSessionsQuery } from "@/queries/realtime/GetActiveLiveSessions.query";
import type { IQueryHandler } from "@/commands/types";
import type {
  GetActiveLiveSessionsResult,
  LiveSessionWithParticipants,
} from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import { liveSessions, liveSessionParticipants, groupMembers } from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and, or, inArray, sql } from "drizzle-orm";

export class GetActiveLiveSessionsHandler
  implements IQueryHandler<GetActiveLiveSessionsQuery, GetActiveLiveSessionsResult>
{
  async execute(query: GetActiveLiveSessionsQuery): Promise<GetActiveLiveSessionsResult> {
    try {
      // 1. Verify user is a member of the group
      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, query.groupId),
          eq(groupMembers.userId, query.userId)
        ),
      });

      if (!membership) {
        throw new DomainError(
          "You must be a member of this group to view sessions",
          "UNAUTHORIZED"
        );
      }

      // 2. Get all active sessions for the group
      const sessions = await db
        .select({
          id: liveSessions.id,
          sessionType: liveSessions.sessionType,
          groupId: liveSessions.groupId,
          hostId: liveSessions.hostId,
          categoryId: liveSessions.categoryId,
          config: liveSessions.config,
          status: liveSessions.status,
          currentCardIndex: liveSessions.currentCardIndex,
          selectedFlashcards: liveSessions.selectedFlashcards,
          startedAt: liveSessions.startedAt,
          endedAt: liveSessions.endedAt,
          createdAt: liveSessions.createdAt,
          hostName: db.schema.users.name,
        })
        .from(liveSessions)
        .innerJoin(db.schema.users, eq(liveSessions.hostId, db.schema.users.id))
        .where(
          and(
            eq(liveSessions.groupId, query.groupId),
            or(
              eq(liveSessions.status, "waiting"),
              eq(liveSessions.status, "active")
            )
          )
        )
        .orderBy(liveSessions.createdAt);

      // 3. Get participant counts for each session
      const sessionIds = sessions.map((s) => s.id);

      let participantCounts: Record<number, number> = {};
      if (sessionIds.length > 0) {
        const counts = await db
          .select({
            sessionId: liveSessionParticipants.sessionId,
            count: sql<number>`COUNT(*)::int`,
          })
          .from(liveSessionParticipants)
          .where(inArray(liveSessionParticipants.sessionId, sessionIds))
          .groupBy(liveSessionParticipants.sessionId);

        participantCounts = counts.reduce(
          (acc, c) => ({ ...acc, [c.sessionId]: c.count }),
          {}
        );
      }

      // 4. Get participants for each session
      let allParticipants: Array<{
        sessionId: number;
        userId: string;
        userName: string | null;
        userImage: string | null;
        joinedAt: Date;
        totalScore: number;
      }> = [];

      if (sessionIds.length > 0) {
        allParticipants = await db
          .select({
            sessionId: liveSessionParticipants.sessionId,
            userId: liveSessionParticipants.userId,
            userName: db.schema.users.name,
            userImage: db.schema.users.image,
            joinedAt: liveSessionParticipants.joinedAt,
            totalScore: liveSessionParticipants.totalScore,
          })
          .from(liveSessionParticipants)
          .innerJoin(
            db.schema.users,
            eq(liveSessionParticipants.userId, db.schema.users.id)
          )
          .where(inArray(liveSessionParticipants.sessionId, sessionIds));
      }

      // 5. Build result with participants
      const result: LiveSessionWithParticipants[] = sessions.map((session) => {
        const participants = allParticipants
          .filter((p) => p.sessionId === session.id)
          .map((p) => ({
            id: 0, // Not used in this context
            sessionId: p.sessionId,
            userId: p.userId,
            userName: p.userName,
            userImage: p.userImage,
            joinedAt: p.joinedAt,
            leftAt: null,
            totalScore: p.totalScore,
            correctAnswers: null,
            totalAnswers: null,
            averageResponseTime: null,
            rank: null,
          }));

        return {
          ...session,
          participants,
          participantCount: participantCounts[session.id] || 0,
          hostName: session.hostName,
        };
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("GetActiveLiveSessionsHandler error:", error);
      return {
        success: false,
        error: "Failed to get active live sessions",
      };
    }
  }
}
