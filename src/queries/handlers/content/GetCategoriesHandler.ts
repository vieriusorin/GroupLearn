import type { GetCategoriesResult } from "@/application/dtos/content.dto";
import type { IQueryHandler } from "@/commands/types";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import { CategoryId, DomainId } from "@/domains/shared/types/branded-types";
import type { GetCategoriesQuery } from "@/queries/content/GetCategories.query";

export class GetCategoriesHandler
  implements IQueryHandler<GetCategoriesQuery, GetCategoriesResult>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(query: GetCategoriesQuery): Promise<GetCategoriesResult> {
    const domainId = DomainId(query.domainId);
    const categories = await this.categoryRepository.findByDomain(domainId);

    // Get flashcard counts for all categories
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const flashcardCount = await this.categoryRepository.countFlashcards(
          CategoryId(category.getId() as number),
        );

        return {
          id: category.getId() as number,
          domainId: category.getDomainId() as number,
          name: category.getName(),
          description: category.getDescription(),
          isDeprecated: category.getIsDeprecated(),
          createdAt: category.getCreatedAt().toISOString(),
          flashcardCount,
        };
      }),
    );

    return {
      categories: categoriesWithCounts,
    };
  }
}
