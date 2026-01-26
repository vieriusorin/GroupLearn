import { logger, task, schedules } from "@trigger.dev/sdk/v3";
import { db } from "@/infrastructure/database/db";
import { onlinePresence } from "@/infrastructure/database/schema/realtime.schema";
import { lt } from "drizzle-orm";

/**
 * Cleanup Stale Presence Task
 *
 * Runs every 5 minutes to mark users as offline if they haven't sent a heartbeat
 * in the last 5 minutes. This prevents stale presence records from showing users
 * as online when they've disconnected without properly closing their connection.
 *
 * Trigger: Scheduled (every 5 minutes)
 * Max Duration: 60 seconds
 */
export const cleanupStalePresence = task({
  id: "cleanup-stale-presence",
  maxDuration: 60, // 1 minute should be plenty for this operation

  // Schedule to run every 5 minutes
  // In production, register this schedule via Trigger.dev dashboard or API
  run: async (payload, { ctx }) => {
    const startTime = Date.now();
    logger.log("Starting stale presence cleanup", { runId: ctx.run.id });

    // Define "stale" as no heartbeat in last 5 minutes
    const staleThreshold = new Date(Date.now() - 5 * 60 * 1000);

    try {
      // Update all stale presence records to offline
      const result = await db
        .update(onlinePresence)
        .set({
          status: "offline",
          updatedAt: new Date()
        })
        .where(lt(onlinePresence.lastSeen, staleThreshold))
        .returning({
          userId: onlinePresence.userId,
          groupId: onlinePresence.groupId
        });

      const duration = Date.now() - startTime;
      const count = result.length;

      logger.log("Stale presence cleanup completed", {
        markedOffline: count,
        duration: `${duration}ms`,
        threshold: staleThreshold.toISOString(),
      });

      return {
        success: true,
        markedOffline: count,
        duration,
        threshold: staleThreshold.toISOString(),
      };
    } catch (error) {
      logger.error("Stale presence cleanup failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  },
});

/**
 * Schedule Configuration
 *
 * To activate this schedule, run:
 * ```bash
 * npx trigger.dev@latest dev
 * ```
 *
 * Then register the schedule in your Trigger.dev dashboard:
 * - Task ID: cleanup-stale-presence
 * - Cron Expression: */5 * * * * (every 5 minutes)
 * - Or use the SDK to create the schedule programmatically
 */
