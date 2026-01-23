import type { CreateDomainResult } from "@/application/dtos/content.dto";
import type { CreateDomainCommand } from "@/commands/content/CreateDomain.command";
import type { ICommandHandler } from "@/commands/types";
import { Domain } from "@/domains/content/entities/Domain";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";

export class CreateDomainHandler
  implements ICommandHandler<CreateDomainCommand, CreateDomainResult>
{
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(command: CreateDomainCommand): Promise<CreateDomainResult> {
    // Validate input
    if (!command.name || !command.name.trim()) {
      throw new DomainError("Domain name is required", "VALIDATION_ERROR");
    }

    // Check if domain name already exists
    const exists = await this.domainRepository.existsByName(
      command.name.trim(),
    );
    if (exists) {
      throw new DomainError(
        "Domain with this name already exists",
        "DOMAIN_NAME_EXISTS",
      );
    }

    // Create domain entity
    const domain = Domain.create(
      command.name.trim(),
      command.description?.trim() || null,
      command.userId,
    );

    // Save via repository
    const savedDomain = await this.domainRepository.save(domain);

    // Return result
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
