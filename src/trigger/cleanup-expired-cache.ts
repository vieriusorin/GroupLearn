import { logger, task } from "@trigger.dev/sdk/v3";
import { db } from "@/infrastructure/database/db";
import { aiResponseCache, aiHints } from "@/infrastructure/database/schema/ai.schema";
import { lt } from "drizzle-orm";

/**
 * Cleanup Expired AI Cache Task
 *
 * Runs daily to remove expired cache entries from both the AI response cache
 * and the hints cache. This prevents the database from growing unbounded with
 * stale cached data.
 *
 * Caches cleaned:
 * - ai_response_cache: General AI responses (24h TTL default)
 * - ai_hints: Socratic hints for flashcards (24h TTL default)
 *
 * Trigger: Scheduled (daily at 02:00 UTC)
 * Max Duration: 10 minutes
 */
export const cleanupExpiredCache = task({
  id: "cleanup-expired-ai-cache",
  maxDuration: 600, // 10 minutes (in case of large cache)

  run: async (payload, { ctx }) => {
    const startTime = Date.now();
    logger.log("Starting expired AI cache cleanup", { runId: ctx.run.id });

    const now = new Date();

    try {
      // Clean up expired response cache entries
      const responsesCleaned = await db
        .delete(aiResponseCache)
        .where(lt(aiResponseCache.expiresAt, now))
        .returning({
          id: aiResponseCache.id,
          cacheKey: aiResponseCache.cacheKey,
          hitCount: aiResponseCache.hitCount,
          modelUsed: aiResponseCache.modelUsed,
        });

      // Clean up expired hints cache entries
      const hintsCleaned = await db
        .delete(aiHints)
        .where(lt(aiHints.expiresAt, now))
        .returning({
          id: aiHints.id,
          flashcardId: aiHints.flashcardId,
        });

      const duration = Date.now() - startTime;

      // Calculate cache effectiveness metrics
      const totalHits = responsesCleaned.reduce((sum, entry) => sum + (entry.hitCount || 0), 0);
      const avgHitsPerEntry = responsesCleaned.length > 0
        ? (totalHits / responsesCleaned.length).toFixed(2)
        : 0;

      // Group by model for insights
      const modelBreakdown = responsesCleaned.reduce((acc, entry) => {
        const model = entry.modelUsed || "unknown";
        acc[model] = (acc[model] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      logger.log("Expired AI cache cleanup completed", {
        responseCacheEntriesCleaned: responsesCleaned.length,
        hintsCacheEntriesCleaned: hintsCleaned.length,
        totalCacheEntriesCleaned: responsesCleaned.length + hintsCleaned.length,
        duration: `${duration}ms`,
        cacheEffectiveness: {
          totalHits,
          avgHitsPerEntry,
          modelBreakdown,
        },
      });

      return {
        success: true,
        responseCacheEntriesCleaned: responsesCleaned.length,
        hintsCacheEntriesCleaned: hintsCleaned.length,
        totalCacheEntriesCleaned: responsesCleaned.length + hintsCleaned.length,
        duration,
        cacheEffectiveness: {
          totalHits,
          avgHitsPerEntry: parseFloat(avgHitsPerEntry as string),
          modelBreakdown,
        },
      };
    } catch (error) {
      logger.error("Expired AI cache cleanup failed", {
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
 * To activate this schedule, register in your Trigger.dev dashboard:
 * - Task ID: cleanup-expired-ai-cache
 * - Cron Expression: 0 2 * * * (daily at 2 AM UTC)
 * - Timezone: UTC
 *
 * Or use a scheduled trigger:
 * ```typescript
 * import { schedules } from "@trigger.dev/sdk/v3";
 *
 * schedules.create({
 *   task: "cleanup-expired-ai-cache",
 *   cron: "0 2 * * *", // Daily at 2 AM UTC
 *   deduplicationKey: "cache-cleanup",
 * });
 * ```
 *
 * Note: Running at 2 AM UTC to avoid peak usage hours and
 * minimize impact on database performance.
 */
