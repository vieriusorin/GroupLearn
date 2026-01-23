"use server";

import type { GroupDetail } from "@/application/dtos/groups.dto";
import { queryHandlers } from "@/infrastructure/di/container";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";
import { getGroupDetailQuery } from "@/queries/groups/GetGroupDetail.query";

export type {
  GroupDetail,
  GroupDetailGroup as Group,
  GroupDetailInvitation as Invitation,
  GroupDetailMember as Member,
} from "@/application/dtos/groups.dto";

export async function getGroupDetail(
  groupId: number,
): Promise<ActionResult<GroupDetail>> {
  return withAuth(["admin", "member"], async (user) => {
    const query = getGroupDetailQuery(user.id, groupId);
    const result = await queryHandlers.groups.getGroupDetail.execute(query);

    return {
      success: true,
      data: result,
    };
  });
}
