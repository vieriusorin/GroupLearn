import type { GetDomainsResult } from "@/application/dtos/content.dto";
import type { IQueryHandler } from "@/commands/types";
import type { IDomainRepository } from "@/domains/content/repositories/IDomainRepository";
import type { GetDomainsQuery } from "@/queries/content/GetDomains.query";

export class GetDomainsHandler
  implements IQueryHandler<GetDomainsQuery, GetDomainsResult>
{
  constructor(private readonly domainRepository: IDomainRepository) {}

  async execute(_query: GetDomainsQuery): Promise<GetDomainsResult> {
    const domains = await this.domainRepository.findAll();

    return {
      domains: domains.map((domain) => ({
        id: domain.getId() as number,
        name: domain.getName(),
        description: domain.getDescription(),
        createdAt: domain.getCreatedAt().toISOString(),
        createdBy: domain.getCreatedBy(),
      })),
    };
  }
}
