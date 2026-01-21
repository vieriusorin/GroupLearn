import { Domain } from "@/domains/content/entities/Domain";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";

/**
 * Request DTO for creating a domain
 */
export interface CreateDomainRequest {
  userId: string;
  name: string;
  description?: string | null;
}

/**
 * Response DTO for domain creation
 */
export interface CreateDomainResponse {
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
 * CreateDomainUseCase
 *
 * Application service that creates a new domain.
 *
 * Flow:
 * 1. Validate input
 * 2. Check if domain name already exists
 * 3. Create Domain entity
 * 4. Save via repository
 * 5. Return DTO
 */
export class CreateDomainUseCase {
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(request: CreateDomainRequest): Promise<CreateDomainResponse> {
    // Validate input
    if (!request.name || !request.name.trim()) {
      throw new DomainError("Domain name is required", "VALIDATION_ERROR");
    }

    // Check if domain name already exists
    const exists = await this.domainRepository.existsByName(
      request.name.trim(),
    );
    if (exists) {
      throw new DomainError(
        "Domain with this name already exists",
        "DOMAIN_NAME_EXISTS",
      );
    }

    // Create domain entity
    const domain = Domain.create(
      request.name.trim(),
      request.description?.trim() || null,
      request.userId,
    );

    // Save via repository
    const savedDomain = await this.domainRepository.save(domain);

    // Return DTO
    return {
      success: true,
      data: {
        id: savedDomain.getId() as number,
        name: savedDomain.getName(),
        description: savedDomain.getDescription(),
        createdAt: savedDomain.getCreatedAt().toISOString(),
        createdBy: savedDomain.getCreatedBy() || null,
      },
    };
  }
}
