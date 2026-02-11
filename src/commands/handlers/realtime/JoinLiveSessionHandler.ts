/**
 * Join Live Session Handler
 *
 * Allows users to join an existing live session.
 * Users must be members of the group to join.
 */

import type { JoinLiveSessionCommand } from "@/commands/realtime/JoinLiveSession.command";
import type { ICommandHandler } from "@/commands/types";
import type { JoinLiveSessionResult } from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import { liveSessions, liveSessionParticipants, groupMembers, groups, users } from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and } from "drizzle-orm";
import { getSocket } from "@/lib/realtime/socket-client";

export class JoinLiveSessionHandler
  implements ICommandHandler<JoinLiveSessionCommand, JoinLiveSessionResult>
{
  async execute(command: JoinLiveSessionCommand): Promise<JoinLiveSessionResult> {
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

      // 2. Verify session is in waiting or active status
      if (session.status !== "waiting" && session.status !== "active") {
        throw new DomainError(
          "Cannot join session - session has ended or been cancelled",
          "SESSION_NOT_JOINABLE"
        );
      }

      // 3. Verify user is a member of the group OR the group admin
      const [membership] = await db
        .select({ id: groupMembers.id })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, session.groupId),
            eq(groupMembers.userId, command.userId)
          )
        )
        .limit(1);

      const [group] = await db
        .select({ adminId: groups.adminId })
        .from(groups)
        .where(eq(groups.id, session.groupId))
        .limit(1);

      const isGroupAdmin = group?.adminId === command.userId;

      if (!membership && !isGroupAdmin) {
        throw new DomainError(
          "You must be a member of this group to join this session",
          "UNAUTHORIZED"
        );
      }

      // 4. Check if user is already a participant
      const [existingParticipant] = await db
        .select()
        .from(liveSessionParticipants)
        .where(
          and(
            eq(liveSessionParticipants.sessionId, command.sessionId),
            eq(liveSessionParticipants.userId, command.userId)
          )
        )
        .limit(1);

      if (existingParticipant) {
        // User already joined - return success with existing data
        return {
          success: true,
          data: {
            sessionId: existingParticipant.sessionId,
            userId: existingParticipant.userId,
            joinedAt: existingParticipant.joinedAt.toISOString(),
          },
        };
      }

      // 5. Add user as participant
      const [participant] = await db
        .insert(liveSessionParticipants)
        .values({
          sessionId: command.sessionId,
          userId: command.userId,
          totalScore: 0,
          rank: null,
        })
        .returning();

      // 6. Get user info for broadcast
      const [user] = await db
        .select({ id: users.id, name: users.name, image: users.image })
        .from(users)
        .where(eq(users.id, command.userId))
        .limit(1);

      // 7. Broadcast participant joined event via Socket.io
      try {
        const socket = getSocket();
        if (socket) {
          socket.to(`session:${command.sessionId}`).emit("session:participant_joined", {
            sessionId: command.sessionId,
            userId: command.userId,
            userName: user?.name || "Unknown",
            userImage: user?.image || null,
          });
        }
      } catch (socketError) {
        console.error("Failed to broadcast participant joined:", socketError);
      }

      return {
        success: true,
        data: {
          sessionId: participant.sessionId,
          userId: participant.userId,
          joinedAt: participant.joinedAt.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("JoinLiveSessionHandler error:", error);
      return {
        success: false,
        error: "Failed to join live session",
      };
    }
  }
}
