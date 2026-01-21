import { Category } from "@/domains/content/entities/Category";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

export interface CreateCategoryRequest {
  userId: string;
  domainId: number;
  name: string;
  description?: string | null;
}

export interface CreateCategoryResponse {
  success: boolean;
  data: {
    id: number;
    domainId: number;
    name: string;
    description: string | null;
    createdAt: string;
  };
}

export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: ICategoryRepository,
    private readonly domainRepository: IDomainRepository,
  ) {}

  async execute(
    request: CreateCategoryRequest,
  ): Promise<CreateCategoryResponse> {
    const domainId = DomainId(request.domainId);

    if (!request.name || !request.name.trim()) {
      throw new DomainError("Category name is required", "VALIDATION_ERROR");
    }

    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }

    const category = Category.create(
      domainId,
      request.name.trim(),
      request.description?.trim() || null,
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
