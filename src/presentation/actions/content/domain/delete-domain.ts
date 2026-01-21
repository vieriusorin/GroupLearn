"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { DeleteDomainResponse } from "@/application/use-cases/content/DeleteDomainUseCase";
import { DeleteDomainUseCase } from "@/application/use-cases/content/DeleteDomainUseCase";
import { repositories } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function deleteDomain(
  domainId: number,
): Promise<ActionResult<DeleteDomainResponse>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!domainId || domainId <= 0) {
      return {
        success: false,
        error: "Invalid domain ID",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new DeleteDomainUseCase(
      repositories.domain,
      repositories.category,
    );

    const result = await useCase.execute({
      userId: user.id,
      domainId,
    });

    revalidatePath("/admin/domains");
    revalidatePath("/domains");
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });

    return {
      success: true,
      data: result,
    };
  });
}
