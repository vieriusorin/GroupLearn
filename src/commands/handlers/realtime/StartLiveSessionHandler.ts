/**
 * Start Live Session Handler
 *
 * Starts a live session (host only).
 * Selects flashcards if not provided and transitions session to active status.
 */

import type { StartLiveSessionCommand } from "@/commands/realtime/StartLiveSession.command";
import type { ICommandHandler } from "@/commands/types";
import type { StartLiveSessionResult } from "@/application/dtos/realtime.dto";
import { db } from "@/infrastructure/database/db";
import { liveSessions, flashcards } from "@/infrastructure/database/schema";
import { DomainError } from "@/domains/shared/errors";
import { eq, and, inArray, sql } from "drizzle-orm";
import { getSocket } from "@/lib/realtime/socket-client";

export class StartLiveSessionHandler
  implements ICommandHandler<StartLiveSessionCommand, StartLiveSessionResult>
{
  async execute(command: StartLiveSessionCommand): Promise<StartLiveSessionResult> {
    try {
      // 1. Get session and verify it exists
      const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, command.sessionId),
      });

      if (!session) {
        throw new DomainError("Live session not found", "SESSION_NOT_FOUND");
      }

      // 2. Verify user is the host
      if (session.hostId !== command.userId) {
        throw new DomainError(
          "Only the session host can start the session",
          "UNAUTHORIZED"
        );
      }

      // 3. Verify session is in waiting status
      if (session.status !== "waiting") {
        throw new DomainError(
          `Cannot start session - current status is ${session.status}`,
          "INVALID_SESSION_STATUS"
        );
      }

      // 4. Select flashcards
      let selectedFlashcardIds: number[];

      if (command.flashcardIds && command.flashcardIds.length > 0) {
        // Use provided flashcard IDs
        selectedFlashcardIds = command.flashcardIds;

        // Verify all flashcards exist
        const existingCards = await db.query.flashcards.findMany({
          where: inArray(flashcards.id, selectedFlashcardIds),
          columns: { id: true },
        });

        if (existingCards.length !== selectedFlashcardIds.length) {
          throw new DomainError(
            "Some flashcards not found",
            "FLASHCARDS_NOT_FOUND"
          );
        }
      } else {
        // Auto-select flashcards based on category or random
        const config = session.config as { cardCount: number };
        const cardCount = config.cardCount || 10;

        let cards;
        if (session.categoryId) {
          // Select from specific category
          cards = await db
            .select({ id: flashcards.id })
            .from(flashcards)
            .where(eq(flashcards.categoryId, session.categoryId))
            .orderBy(sql`RANDOM()`)
            .limit(cardCount);
        } else {
          // Select random flashcards from any category in the group
          // For now, just get random flashcards (TODO: filter by group domains)
          cards = await db
            .select({ id: flashcards.id })
            .from(flashcards)
            .orderBy(sql`RANDOM()`)
            .limit(cardCount);
        }

        if (cards.length === 0) {
          throw new DomainError(
            "No flashcards available for this session",
            "NO_FLASHCARDS"
          );
        }

        selectedFlashcardIds = cards.map((c) => c.id);
      }

      // 5. Update session status to active with selected flashcards
      const [updatedSession] = await db
        .update(liveSessions)
        .set({
          status: "active",
          startedAt: new Date(),
          selectedFlashcards: selectedFlashcardIds,
          currentCardIndex: 0,
        })
        .where(eq(liveSessions.id, command.sessionId))
        .returning();

      // 6. Get first flashcard details
      const firstCard = await db.query.flashcards.findFirst({
        where: eq(flashcards.id, selectedFlashcardIds[0]),
      });

      // 7. Broadcast session started event via Socket.io
      try {
        const socket = getSocket();
        if (socket) {
          const config = session.config as { timeLimit: number };

          socket.to(`session:${command.sessionId}`).emit("session:started", {
            sessionId: command.sessionId,
            startedAt: updatedSession.startedAt!.toISOString(),
          });

          // Also broadcast first card
          socket.to(`session:${command.sessionId}`).emit("session:card_revealed", {
            sessionId: command.sessionId,
            cardIndex: 0,
            flashcard: firstCard,
            timeLimit: config.timeLimit,
          });
        }
      } catch (socketError) {
        console.error("Failed to broadcast session start:", socketError);
      }

      return {
        success: true,
        data: {
          sessionId: updatedSession.id,
          status: updatedSession.status,
          startedAt: updatedSession.startedAt!.toISOString(),
          selectedFlashcards: selectedFlashcardIds,
        },
      };
    } catch (error) {
      if (error instanceof DomainError) {
        return {
          success: false,
          error: error.message,
        };
      }

      console.error("StartLiveSessionHandler error:", error);
      return {
        success: false,
        error: "Failed to start live session",
      };
    }
  }
}
