/**
 * Get Live Session Detail Handler
 *
 * Retrieves complete information about a live session including:
 * - Session metadata and configuration
 * - Host information
 * - Participant list
 * - Selected flashcards (if session has started)
 * - Current status and progress
 */

import type { GetLiveSessionDetailQuery } from "@/queries/realtime/GetLiveSessionDetail.query";
import type { IQueryHandler } from "@/commands/types";
import type { GetLiveSessionDetailResult, LiveSessionDetail } from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import { liveSessions, liveSessionParticipants, flashcards, groupMembers } from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and, inArray } from "drizzle-orm";

export class GetLiveSessionDetailHandler
  implements IQueryHandler<GetLiveSessionDetailQuery, GetLiveSessionDetailResult>
{
  async execute(query: GetLiveSessionDetailQuery): Promise<GetLiveSessionDetailResult> {
    try {
      // 1. Get session with host and category info
      const sessionData = await db
        .select({
          session: liveSessions,
          hostName: db.schema.users.name,
          hostImage: db.schema.users.image,
          categoryName: db.schema.categories.name,
        })
        .from(liveSessions)
        .leftJoin(db.schema.users, eq(liveSessions.hostId, db.schema.users.id))
        .leftJoin(db.schema.categories, eq(liveSessions.categoryId, db.schema.categories.id))
        .where(eq(liveSessions.id, query.sessionId))
        .limit(1);

      if (sessionData.length === 0) {
        throw new DomainError("Live session not found", "SESSION_NOT_FOUND");
      }

      const { session, hostName, hostImage, categoryName } = sessionData[0];

      // 2. Verify user has access (must be a member of the group)
      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, session.groupId),
          eq(groupMembers.userId, query.userId)
        ),
      });

      if (!membership) {
        throw new DomainError(
          "You must be a member of this group to view this session",
          "UNAUTHORIZED"
        );
      }

      // 3. Get all participants with user info
      const participants = await db
        .select({
          id: liveSessionParticipants.id,
          sessionId: liveSessionParticipants.sessionId,
          userId: liveSessionParticipants.userId,
          userName: db.schema.users.name,
          userImage: db.schema.users.image,
          joinedAt: liveSessionParticipants.joinedAt,
          leftAt: liveSessionParticipants.leftAt,
          totalScore: liveSessionParticipants.totalScore,
          correctAnswers: liveSessionParticipants.correctAnswers,
          totalAnswers: liveSessionParticipants.totalAnswers,
          averageResponseTime: liveSessionParticipants.averageResponseTime,
          rank: liveSessionParticipants.rank,
        })
        .from(liveSessionParticipants)
        .innerJoin(db.schema.users, eq(liveSessionParticipants.userId, db.schema.users.id))
        .where(eq(liveSessionParticipants.sessionId, query.sessionId))
        .orderBy(liveSessionParticipants.joinedAt);

      // 4. Get flashcard details if session has started
      let selectedFlashcardsDetails: Array<{
        id: number;
        question: string;
        answer: string;
        difficulty: string;
      }> = [];

      const selectedFlashcardIds = session.selectedFlashcards as number[] | null;
      if (selectedFlashcardIds && selectedFlashcardIds.length > 0) {
        const flashcardsData = await db
          .select({
            id: flashcards.id,
            question: flashcards.question,
            answer: flashcards.answer,
            difficulty: flashcards.difficulty,
          })
          .from(flashcards)
          .where(inArray(flashcards.id, selectedFlashcardIds));

        // Preserve original order from selectedFlashcardIds
        selectedFlashcardsDetails = selectedFlashcardIds
          .map((id) => flashcardsData.find((f) => f.id === id))
          .filter((f): f is typeof flashcardsData[0] => f !== undefined);
      }

      // 5. Build detailed session result
      const sessionDetail: LiveSessionDetail = {
        ...session,
        participants: participants.map((p) => ({
          ...p,
          userName: p.userName || "Unknown",
          userImage: p.userImage,
        })),
        participantCount: participants.length,
        hostName: hostName || "Unknown",
        hostImage: hostImage || null,
        categoryName: categoryName || null,
        selectedFlashcards: selectedFlashcardsDetails.length > 0
          ? selectedFlashcardsDetails
          : undefined,
      };

      return {
        success: true,
        data: sessionDetail,
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("GetLiveSessionDetailHandler error:", error);
      return {
        success: false,
        error: "Failed to get live session details",
      };
    }
  }
}
