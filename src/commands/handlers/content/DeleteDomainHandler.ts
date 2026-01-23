import type { DeleteResult } from "@/application/dtos/content.dto";
import type { DeleteDomainCommand } from "@/commands/content/DeleteDomain.command";
import type { ICommandHandler } from "@/commands/types";
import type { ICategoryRepository } from "@/domains/content/repositories/ICategoryRepository";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainError } from "@/domains/shared/errors";
import { DomainId } from "@/domains/shared/types/branded-types";

export class DeleteDomainHandler
  implements ICommandHandler<DeleteDomainCommand, DeleteResult>
{
  constructor(
    private readonly domainRepository: IDomainRepository,
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(command: DeleteDomainCommand): Promise<DeleteResult> {
    const domainId = DomainId(command.domainId);

    const domain = await this.domainRepository.findById(domainId);
    if (!domain) {
      throw new DomainError("Domain not found", "DOMAIN_NOT_FOUND");
    }

    const categories = await this.categoryRepository.findByDomain(domainId);
    if (categories.length > 0) {
      throw new DomainError(
        `Cannot delete domain: it has ${categories.length} categories. Delete categories first.`,
        "DOMAIN_HAS_CATEGORIES",
      );
    }

    await this.domainRepository.delete(domainId);

    return {
      success: true,
      message: "Domain deleted successfully",
    };
  }
}
