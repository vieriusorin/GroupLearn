import type { CreateCategoryResult } from "@/application/dtos/content.dto";
import type { CreateCategoryCommand } from "@/commands/content/CreateCategory.command";
import type { ICommandHandler } from "@/commands/types";
import { Category } from "@/domains/content/entities/Category";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

export class CreateCategoryHandler
  implements ICommandHandler<CreateCategoryCommand, CreateCategoryResult>
{
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly domainRepository: IDomainRepository,
  ) {}

  async execute(command: CreateCategoryCommand): Promise<CreateCategoryResult> {
    const domainId = DomainId(command.domainId);

    if (!command.name || !command.name.trim()) {
      throw new DomainError("Category name is required", "VALIDATION_ERROR");
    }

    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }

    const category = Category.create(
      domainId,
      command.name.trim(),
      command.description?.trim() || null,
    );

    const savedCategory = await this.categoryRepository.save(category);

    return {
      success: true,
      data: {
        id: savedCategory.getId() as number,
        domainId: savedCategory.getDomainId() as number,
        name: savedCategory.getName(),
        description: savedCategory.getDescription(),
        createdAt: savedCategory.getCreatedAt().toISOString(),
      },
    };
  }
}
