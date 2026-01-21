"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { UpdateDomainResponse } from "@/application/use-cases/content/UpdateDomainUseCase";
import { UpdateDomainUseCase } from "@/application/use-cases/content/UpdateDomainUseCase";
import { repositories } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function updateDomain(
  domainId: number,
  name?: string,
  description?: string | null,
): Promise<ActionResult<UpdateDomainResponse["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!domainId || domainId <= 0) {
      return {
        success: false,
        error: "Invalid domain ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new UpdateDomainUseCase(repositories.domain);

    const result = await useCase.execute({
      userId: user.id,
      domainId,
      name,
      description,
    });

    // Revalidate pages that depend on domains so UI reflects the updated data
    revalidatePath("/admin/domains");
    revalidatePath("/domains");
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
