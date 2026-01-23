"use server";

import type { UserPathsResponse } from "@/application/dtos/admin.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getUserPathsQuery } from "@/queries/admin/GetUserPaths.query";

export type {
  PathWithAccess,
  UserPathsResponse,
} from "@/application/dtos/admin.dto";

export async function getUserPaths(
  userId: string,
): Promise<ActionResult<UserPathsResponse>> {
  return withAuth(["admin"], async (_user) => {
    const query = getUserPathsQuery(userId);
    const result = await queryHandlers.admin.getUserPaths.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
