import type { IQueryHandler } from "@/commands/types";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import { DomainId } from "@/domains/shared/types/branded-types";
import type { Domain } from "@/infrastructure/database/schema";
import type { GetDomainByIdQuery } from "@/queries/content/GetDomainById.query";

export class GetDomainByIdHandler
  implements IQueryHandler<GetDomainByIdQuery, Domain | undefined>
{
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(query: GetDomainByIdQuery): Promise<Domain | undefined> {
    const domain = await this.domainRepository.findById(DomainId(query.id));
    if (!domain) {
      return undefined;
    }

    return {
      id: domain.getId() as number,
      name: domain.getName(),
      description: domain.getDescription(),
      createdAt: domain.getCreatedAt(),
      createdBy: domain.getCreatedBy(),
    } as Domain;
  }
}
