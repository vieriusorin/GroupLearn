"use server";

import type { MyGroupListItem } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getMyGroupsQuery } from "@/queries/groups/GetMyGroups.query";

export async function getMyGroups(): Promise<ActionResult<MyGroupListItem[]>> {
  return withAuth(["admin", "member"], async (user) => {
    const query = getMyGroupsQuery(user.id);
    const result = await queryHandlers.groups.getMyGroups.execute(query);

    return {
      success: true,
      data: result.groups,
    };
  });
}
