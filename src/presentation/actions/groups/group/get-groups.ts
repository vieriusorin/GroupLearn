"use server";

import type { GroupListItem } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getGroupsQuery } from "@/queries/groups/GetGroups.query";

export async function getGroups(): Promise<ActionResult<GroupListItem[]>> {
  return withAuth(["admin", "member"], async (user) => {
    const query = getGroupsQuery(user.id);
    const result = await queryHandlers.groups.getGroups.execute(query);

    return {
      success: true,
      data: result.groups,
    };
  });
}
