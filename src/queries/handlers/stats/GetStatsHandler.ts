import { unstable_cache } from "next/cache";
import type {
  DashboardStats,
  DomainProgress,
  GetStatsResult,
} from "@/application/dtos";
import type { IQueryHandler } from "@/commands/types";
import { getAccessibleDomainsForUser } from "@/lib/auth/authorization";
import { CategoryService } from "@/lib/content/category-service";
import { FlashcardService } from "@/lib/content/flashcard-service";
import { ReviewService } from "@/lib/review/review-service";
import type { GetStatsQuery } from "@/queries/stats/GetStats.query";

async function computeStats(_userId: string): Promise<DashboardStats> {
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
        totalCards: flatFlashcards.length,
        masteredCards: mastered,
        dueCards: due,
      };
    }),
  );

  const stats: DashboardStats = {
    totalCards: domainsProgress.reduce((sum, dp) => sum + dp.totalCards, 0),
    cardsDueToday: dueFlashcards.length,
    cardsReviewedToday: await ReviewService.getTodayCount(),
    currentStreak: await ReviewService.getCurrentStreak(),
    strugglingCards: strugglingCards.length,
    domainsProgress: domainsProgress,
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

export class GetStatsHandler
  implements IQueryHandler<GetStatsQuery, GetStatsResult>
{
  async execute(query: GetStatsQuery): Promise<GetStatsResult> {
    const stats = await getCachedStats(query.userId);

    return {
      stats,
    };
  }
}
