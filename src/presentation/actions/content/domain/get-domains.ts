"use server";

import type { GetDomainsResult } from "@/application/dtos/content.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getDomainsQuery } from "@/queries/content/GetDomains.query";

export async function getDomains(): Promise<ActionResult<GetDomainsResult>> {
  return withAuth(["admin", "member"], async (_user) => {
    const query = getDomainsQuery();
    const result = await queryHandlers.content.getDomains.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
