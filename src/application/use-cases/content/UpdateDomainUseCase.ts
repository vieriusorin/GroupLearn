import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

/**
 * Request DTO for updating a domain
 */
export interface UpdateDomainRequest {
  userId: string;
  domainId: number;
  name?: string;
  description?: string | null;
}

/**
 * Response DTO for domain update
 */
export interface UpdateDomainResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    createdBy: string | null;
  };
}

/**
 * UpdateDomainUseCase
 *
 * Application service that updates a domain.
 *
 * Flow:
 * 1. Load domain
 * 2. Validate ownership (optional - can be done in authorization layer)
 * 3. Call domain.updateName/updateDescription
 * 4. Save
 * 5. Return DTO
 */
export class UpdateDomainUseCase {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(request: UpdateDomainRequest): Promise<UpdateDomainResponse> {
    const domainId = DomainId(request.domainId);

    // Load domain
    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }

    // Update name if provided
    if (request.name !== undefined) {
      if (!request.name.trim()) {
        throw new DomainError(
          "Domain name cannot be empty",
          "VALIDATION_ERROR",
        );
      }
      domain.updateName(request.name.trim());
    }

    // Update description if provided
    if (request.description !== undefined) {
      domain.updateDescription(request.description?.trim() || null);
    }

    // Save updated domain
    const updatedDomain = await this.domainRepository.save(domain);

    // Return DTO
    return {
      success: true,
      data: {
        id: updatedDomain.getId() as number,
        name: updatedDomain.getName(),
        description: updatedDomain.getDescription(),
        createdAt: updatedDomain.getCreatedAt().toISOString(),
        createdBy: updatedDomain.getCreatedBy() || null,
      },
    };
  }
}
