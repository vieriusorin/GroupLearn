import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for deleting a domain
 */
export interface DeleteDomainRequest {
  userId: string;
  domainId: number;
}

/**
 * Response DTO for domain deletion
 */
export interface DeleteDomainResponse {
  success: boolean;
  message: string;
}

/**
 * DeleteDomainUseCase
 *
 * Application service that deletes a domain (with cascade check).
 *
 * Flow:
 * 1. Load domain
 * 2. Check for categories
 * 3. Delete via repository
 * 4. Return success
 */
export class DeleteDomainUseCase {
  constructor(
    private readonly domainRepository: IDomainRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(request: DeleteDomainRequest): Promise<DeleteDomainResponse> {
    const domainId = DomainId(request.domainId);

    // Load domain
    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }

    // Check for categories
    const categories = await this.categoryRepository.findByDomain(domainId);
    if (categories.length > 0) {
      throw new DomainError(
        `Cannot delete domain: it has ${categories.length} categories. Delete categories first.`,
        "DOMAIN_HAS_CATEGORIES",
      );
    }

    // Delete via repository
    await this.domainRepository.delete(domainId);

    return {
      success: true,
      message: "Domain deleted successfully",
    };
  }
}
