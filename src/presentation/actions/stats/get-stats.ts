"use server";

import { unstable_cache } from "next/cache";
import { getAccessibleDomainsForUser } from "@/lib/authorization";
import { CategoryService } from "@/lib/services/category-service";
import { FlashcardService } from "@/lib/services/flashcard-service";
import { ReviewService } from "@/lib/services/review-service";
import type { DashboardStats, DomainProgress } from "@/lib/types";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

async function computeStats(_userId: string): Promise<DashboardStats> {
  // Auth has already been performed via `withAuth`, so we can safely load
  // all accessible domains using a helper that does *not* hit dynamic APIs
  // like `headers()`/`auth()`. This keeps the cached scope compliant with
  // Next.js restrictions.
  const domains = await getAccessibleDomainsForUser();
  const [dueFlashcards, strugglingCards] = await Promise.all([
    ReviewService.getDueCards(),
    ReviewService.getStrugglingCards(),
  ]);

  const domainsProgress: DomainProgress[] = await Promise.all(
    domains.map(async (domain) => {
      const categories = await CategoryService.getByDomain(domain.id);
      const _allFlashcards = (
        Array.isArray(categories) ? categories : categories.data
      ).flatMap((_cat) => [] as never[]);

      // Use FlashcardService for mastery-level and per-category cards
      const flashcardsPerCategory = await Promise.all(
        (Array.isArray(categories) ? categories : categories.data).map((cat) =>
          FlashcardService.getByCategory(cat.id),
        ),
      );
      const flatFlashcards = flashcardsPerCategory.flatMap((res) =>
        Array.isArray(res) ? res : res.data,
      );

      const mastered = await (async () => {
        const levels = await Promise.all(
          flatFlashcards.map((card) =>
            FlashcardService.getMasteryLevel(card.id),
          ),
        );
        return levels.filter((lvl) => lvl === "mastered").length;
      })();

      const due = flatFlashcards.filter((card) =>
        dueFlashcards.some((dueCard) => dueCard.id === card.id),
      ).length;

      return {
        domain,
        total_cards: flatFlashcards.length,
        mastered_cards: mastered,
        due_cards: due,
      };
    }),
  );

  const stats: DashboardStats = {
    total_cards: domainsProgress.reduce((sum, dp) => sum + dp.total_cards, 0),
    cards_due_today: dueFlashcards.length,
    cards_reviewed_today: await ReviewService.getTodayCount(),
    current_streak: await ReviewService.getCurrentStreak(),
    struggling_cards: strugglingCards.length,
    domains_progress: domainsProgress,
  };

  return stats;
}

function getCachedStats(userId: string): Promise<DashboardStats> {
  return unstable_cache(
    async () => computeStats(userId),
    ["dashboard-stats", userId],
    {
      tags: ["dashboard-stats"],
    },
  )();
}

export async function getStats(): Promise<ActionResult<DashboardStats>> {
  return withAuth(["admin", "member"], async (user) => {
    try {
      const stats = await getCachedStats(user.id);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch stats",
        code: "FETCH_ERROR",
      };
    }
  });
}
