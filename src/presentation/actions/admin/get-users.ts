"use server";

import type { AdminUser } from "@/application/dtos/admin.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getUsersQuery } from "@/queries/admin/GetUsers.query";

export type { AdminUser } from "@/application/dtos/admin.dto";

export async function getUsers(): Promise<ActionResult<AdminUser[]>> {
  return withAuth(["admin"], async (_user) => {
    const query = getUsersQuery();
    const result = await queryHandlers.admin.getUsers.execute(query);

    return {
      success: true,
      data: result.users,
    };
  });
}
