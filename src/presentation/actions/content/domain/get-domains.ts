"use server";

import { repositories } from "@/infrastructure/di/container";
import type { ActionResult, AdminDomainDto } from "@/presentation/types";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function getDomains(): Promise<ActionResult<AdminDomainDto[]>> {
  return withAuth(["admin", "member"], async (_user) => {
    const domains = await repositories.domain.findAll();

    const domainsData: AdminDomainDto[] = domains.map((domain) => ({
      id: domain.getId() as number,
      name: domain.getName(),
      description: domain.getDescription(),
      createdAt: domain.getCreatedAt().toISOString(),
      createdBy: domain.getCreatedBy(),
    }));

    return {
      success: true,
      data: domainsData,
    };
  });
}
