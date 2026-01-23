import type { IQueryHandler } from "@/commands/types";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import { CategoryId } from "@/domains/shared/types/branded-types";
import type { Category } from "@/infrastructure/database/schema";
import type { GetCategoryByIdQuery } from "@/queries/content/GetCategoryById.query";

export class GetCategoryByIdHandler
  implements IQueryHandler<GetCategoryByIdQuery, Category | undefined>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(query: GetCategoryByIdQuery): Promise<Category | undefined> {
    const category = await this.categoryRepository.findById(
      CategoryId(query.id),
    );
    if (!category) {
      return undefined;
    }

    return {
      id: category.getId() as number,
      domainId: category.getDomainId() as number,
      name: category.getName(),
      description: category.getDescription(),
      createdAt: category.getCreatedAt(),
      createdBy: null,
      isDeprecated: false,
    } as Category;
  }
}
