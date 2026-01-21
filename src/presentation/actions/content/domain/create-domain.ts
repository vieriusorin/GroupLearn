"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { CreateDomainResponse } from "@/application/use-cases/content/CreateDomainUseCase";
import { CreateDomainUseCase } from "@/application/use-cases/content/CreateDomainUseCase";
import { repositories } from "@/infrastructure/di/container";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export async function createDomain(
  name: string,
  description?: string | null,
): Promise<ActionResult<CreateDomainResponse["data"]>> {
  return withAuth(["admin", "member"], async (user) => {
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: "Domain name is required",
        code: "VALIDATION_ERROR",
      };
    }

    const useCase = new CreateDomainUseCase(repositories.domain);

    const result = await useCase.execute({
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    });

    revalidatePath("/admin/domains");
    revalidatePath("/domains");
    revalidateTag(CACHE_TAGS.paths, { expire: 0 });

    return {
      success: true,
      data: result.data,
    };
  });
}
