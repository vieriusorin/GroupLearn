/**
 * Create Live Session Handler
 *
 * Handles the creation of new live quiz/study sessions within a group.
 * Only group admins or members can create sessions.
 */

import type { CreateLiveSessionCommand } from "@/commands/realtime/CreateLiveSession.command";
import type { ICommandHandler } from "@/commands/types";
import type { CreateLiveSessionResult } from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import { liveSessions, liveSessionParticipants, groupMembers } from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and } from "drizzle-orm";
import { getSocket } from "@/lib/realtime/socket-client";

export class CreateLiveSessionHandler
  implements ICommandHandler<CreateLiveSessionCommand, CreateLiveSessionResult>
{
  async execute(command: CreateLiveSessionCommand): Promise<CreateLiveSessionResult> {
    try {
      // 1. Validate user is a member of the group
      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, command.groupId),
          eq(groupMembers.userId, command.userId)
        ),
      });

      if (!membership) {
        throw new DomainError(
          "You must be a member of this group to create sessions",
          "UNAUTHORIZED"
        );
      }

      // 2. Validate configuration
      if (command.config.cardCount < 5 || command.config.cardCount > 50) {
        throw new DomainError(
          "Card count must be between 5 and 50",
          "VALIDATION_ERROR"
        );
      }

      if (command.config.timeLimit < 10 || command.config.timeLimit > 120) {
        throw new DomainError(
          "Time limit must be between 10 and 120 seconds",
          "VALIDATION_ERROR"
        );
      }

      // 3. If category specified, validate it exists
      if (command.categoryId) {
        const category = await db.query.categories.findFirst({
          where: eq(db.schema.categories.id, command.categoryId),
        });

        if (!category) {
          throw new DomainError("Category not found", "CATEGORY_NOT_FOUND");
        }
      }

      // 4. Create the live session
      const [session] = await db
        .insert(liveSessions)
        .values({
          sessionType: command.sessionType,
          groupId: command.groupId,
          hostId: command.userId,
          categoryId: command.categoryId,
          config: command.config,
          status: "waiting",
          currentCardIndex: 0,
          selectedFlashcards: null,
        })
        .returning();

      // 5. Automatically add host as first participant
      await db.insert(liveSessionParticipants).values({
        sessionId: session.id,
        userId: command.userId,
        totalScore: 0,
        rank: null,
      });

      // 6. Broadcast session creation to group via Socket.io
      try {
        const socket = getSocket();
        if (socket) {
          socket.to(`group:${command.groupId}`).emit("session:created", {
            sessionId: session.id,
            groupId: command.groupId,
            sessionType: command.sessionType,
            hostId: command.userId,
          });
        }
      } catch (socketError) {
        // Non-critical: log but don't fail the command
        console.error("Failed to broadcast session creation:", socketError);
      }

      return {
        success: true,
        data: {
          id: session.id,
          sessionType: session.sessionType,
          groupId: session.groupId,
          hostId: session.hostId,
          status: session.status,
          config: session.config as Record<string, any>,
          createdAt: session.createdAt.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("CreateLiveSessionHandler error:", error);
      return {
        success: false,
        error: "Failed to create live session",
      };
    }
  }
}
