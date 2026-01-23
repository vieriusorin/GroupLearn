import type { UpdateDomainResult } from "@/application/dtos/content.dto";
import type { UpdateDomainCommand } from "@/commands/content/UpdateDomain.command";
import type { ICommandHandler } from "@/commands/types";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

export class UpdateDomainHandler
  implements ICommandHandler<UpdateDomainCommand, UpdateDomainResult>
{
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(command: UpdateDomainCommand): Promise<UpdateDomainResult> {
    const domainId = DomainId(command.domainId);

    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }

    if (command.name !== undefined) {
      if (!command.name.trim()) {
        throw new DomainError(
          "Domain name cannot be empty",
          "VALIDATION_ERROR",
        );
      }
      domain.updateName(command.name.trim());
    }

    if (command.description !== undefined) {
      domain.updateDescription(command.description?.trim() || null);
    }

    const updatedDomain = await this.domainRepository.save(domain);

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
