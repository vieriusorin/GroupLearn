import { logger, task } from "@trigger.dev/sdk/v3";
import { db } from "@/infrastructure/database/db";
import { aiUsageQuotas } from "@/infrastructure/database/schema/ai.schema";
import { lt } from "drizzle-orm";
import { startOfMonth } from "date-fns";

/**
 * Reset Monthly AI Quotas Task
 *
 * Runs on the 1st of each month at 00:00 UTC to reset monthly AI operation counts.
 * This is separate from daily quotas and tracks aggregate monthly usage.
 *
 * Free tier: 500 operations/month
 * Premium tier: Unlimited (future)
 *
 * Trigger: Scheduled (monthly on 1st at 00:00 UTC)
 * Max Duration: 5 minutes
 */
export const resetMonthlyAIQuotas = task({
  id: "reset-monthly-ai-quotas",
  maxDuration: 300, // 5 minutes

  run: async (payload, { ctx }) => {
    const startTime = Date.now();
    logger.log("Starting monthly AI quota reset", { runId: ctx.run.id });

    try {
      const thisMonth = startOfMonth(new Date());

      // Reset monthly quotas for users whose monthlyResetAt is before this month
      const result = await db
        .update(aiUsageQuotas)
        .set({
          monthlyOperationsUsed: 0,
          monthlyTokensUsed: 0,
          monthlyResetAt: thisMonth,
          updatedAt: new Date(),
        })
        .where(lt(aiUsageQuotas.monthlyResetAt, thisMonth))
        .returning({
          userId: aiUsageQuotas.userId,
          tier: aiUsageQuotas.tier,
          previousMonthlyUsage: aiUsageQuotas.monthlyOperationsUsed,
          previousMonthlyTokens: aiUsageQuotas.monthlyTokensUsed,
        });

      const duration = Date.now() - startTime;
      const count = result.length;

      // Calculate aggregate statistics
      const stats = result.reduce(
        (acc, user) => {
          const tier = user.tier || "free";
          if (!acc.tierStats[tier]) {
            acc.tierStats[tier] = {
              count: 0,
              totalOperations: 0,
              totalTokens: 0,
            };
          }
          acc.tierStats[tier].count++;
          acc.tierStats[tier].totalOperations += user.previousMonthlyUsage || 0;
          acc.tierStats[tier].totalTokens += user.previousMonthlyTokens || 0;

          acc.totalOperations += user.previousMonthlyUsage || 0;
          acc.totalTokens += user.previousMonthlyTokens || 0;

          return acc;
        },
        {
          tierStats: {} as Record<string, { count: number; totalOperations: number; totalTokens: number }>,
          totalOperations: 0,
          totalTokens: 0,
        }
      );

      // Calculate estimated cost (rough estimate based on Claude pricing)
      // Claude Sonnet: ~$3/MTok input + $15/MTok output (average ~$9/MTok)
      const estimatedCost = (stats.totalTokens * 9) / 1_000_000;

      logger.log("Monthly AI quota reset completed", {
        usersReset: count,
        duration: `${duration}ms`,
        resetDate: thisMonth.toISOString(),
        previousMonthStats: {
          totalOperations: stats.totalOperations,
          totalTokens: stats.totalTokens,
          estimatedCost: `$${estimatedCost.toFixed(2)}`,
          tierBreakdown: stats.tierStats,
        },
      });

      return {
        success: true,
        usersReset: count,
        duration,
        resetDate: thisMonth.toISOString(),
        previousMonthStats: {
          totalOperations: stats.totalOperations,
          totalTokens: stats.totalTokens,
          estimatedCost,
          tierBreakdown: stats.tierStats,
        },
      };
    } catch (error) {
      logger.error("Monthly AI quota reset failed", {
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
 * - Task ID: reset-monthly-ai-quotas
 * - Cron Expression: 0 0 1 * * (1st of month at midnight UTC)
 * - Timezone: UTC
 *
 * Or use a scheduled trigger:
 * ```typescript
 * import { schedules } from "@trigger.dev/sdk/v3";
 *
 * schedules.create({
 *   task: "reset-monthly-ai-quotas",
 *   cron: "0 0 1 * *", // 1st of month at midnight UTC
 *   deduplicationKey: "monthly-quota-reset",
 * });
 * ```
 *
 * Note: This task provides valuable analytics about AI usage patterns
 * and costs, which can inform pricing and feature decisions.
 */
