import { logger, task } from "@trigger.dev/sdk/v3";
import { db } from "@/infrastructure/database/db";
import { aiUsageQuotas } from "@/infrastructure/database/schema/ai.schema";
import { lt } from "drizzle-orm";
import { startOfDay, subDays } from "date-fns";

/**
 * Reset Daily AI Quotas Task
 *
 * Runs daily at midnight UTC to reset daily AI operation counts for all users.
 * This allows users to make AI requests again after reaching their daily limit.
 *
 * Free tier: 10 operations/day
 * Premium tier: 100 operations/day (future)
 *
 * Trigger: Scheduled (daily at 00:00 UTC)
 * Max Duration: 5 minutes
 */
export const resetDailyAIQuotas = task({
  id: "reset-daily-ai-quotas",
  maxDuration: 300, // 5 minutes

  run: async (payload, { ctx }) => {
    const startTime = Date.now();
    logger.log("Starting daily AI quota reset", { runId: ctx.run.id });

    try {
      const today = startOfDay(new Date());

      // Reset quotas for users whose lastResetDate is before today
      const result = await db
        .update(aiUsageQuotas)
        .set({
          dailyOperationsUsed: 0,
          lastResetDate: today,
          updatedAt: new Date(),
        })
        .where(lt(aiUsageQuotas.lastResetDate, today))
        .returning({
          userId: aiUsageQuotas.userId,
          tier: aiUsageQuotas.tier,
          previousUsage: aiUsageQuotas.dailyOperationsUsed,
        });

      const duration = Date.now() - startTime;
      const count = result.length;

      // Log summary statistics
      const tierStats = result.reduce((acc, user) => {
        const tier = user.tier || "free";
        if (!acc[tier]) {
          acc[tier] = { count: 0, totalPreviousUsage: 0 };
        }
        acc[tier].count++;
        acc[tier].totalPreviousUsage += user.previousUsage || 0;
        return acc;
      }, {} as Record<string, { count: number; totalPreviousUsage: number }>);

      logger.log("Daily AI quota reset completed", {
        usersReset: count,
        duration: `${duration}ms`,
        resetDate: today.toISOString(),
        tierBreakdown: tierStats,
      });

      return {
        success: true,
        usersReset: count,
        duration,
        resetDate: today.toISOString(),
        tierStats,
      };
    } catch (error) {
      logger.error("Daily AI quota reset failed", {
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
 * - Task ID: reset-daily-ai-quotas
 * - Cron Expression: 0 0 * * * (daily at midnight UTC)
 * - Timezone: UTC
 *
 * Or use a scheduled trigger:
 * ```typescript
 * import { schedules } from "@trigger.dev/sdk/v3";
 *
 * schedules.create({
 *   task: "reset-daily-ai-quotas",
 *   cron: "0 0 * * *", // Daily at midnight UTC
 *   deduplicationKey: "daily-quota-reset",
 * });
 * ```
 */
