import { and, count, desc, eq, inArray } from "drizzle-orm";
import type {
  GetGroupsResult,
  GroupListItem,
} from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { InvitationStatus } from "@/infrastructure/database/schema/enums";
import {
  groupInvitations,
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import { isAdmin } from "@/lib/auth/rbac";
import type { GetGroupsQuery } from "@/queries/groups/GetGroups.query";

export class GetGroupsHandler
  implements IQueryHandler<GetGroupsQuery, GetGroupsResult>
{
  async execute(query: GetGroupsQuery): Promise<GetGroupsResult> {
    const userIsAdmin = await isAdmin();

    const baseQuery = db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdBy: groups.adminId,
        createdAt: groups.createdAt,
        adminName: users.name,
        adminEmail: users.email,
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id));

    const groupsList = userIsAdmin
      ? await baseQuery.orderBy(desc(groups.createdAt))
      : await baseQuery
          .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
          .where(eq(groupMembers.userId, query.userId))
          .orderBy(desc(groups.createdAt));

    const groupIds = groupsList.map((g) => g.id);

    if (groupIds.length === 0) {
      return { groups: [] };
    }

    // Get member counts for all groups
    const memberCounts = await db
      .select({
        groupId: groupMembers.groupId,
        count: count(),
      })
      .from(groupMembers)
      .where(inArray(groupMembers.groupId, groupIds))
      .groupBy(groupMembers.groupId);

    const memberCountMap = new Map<number, number>();
    for (const row of memberCounts) {
      memberCountMap.set(row.groupId, Number(row.count ?? 0));
    }

    // Get pending invitation counts for all groups
    const pendingInvitations = await db
      .select({
        groupId: groupInvitations.groupId,
        count: count(),
      })
      .from(groupInvitations)
      .where(
        and(
          eq(groupInvitations.status, InvitationStatus.PENDING),
          inArray(groupInvitations.groupId, groupIds),
        ),
      )
      .groupBy(groupInvitations.groupId);

    const pendingInvitationMap = new Map<number, number>();
    for (const row of pendingInvitations) {
      pendingInvitationMap.set(row.groupId, Number(row.count ?? 0));
    }

    const result: GroupListItem[] = groupsList.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      createdBy: g.createdBy,
      createdAt: g.createdAt.toISOString(),
      adminName: g.adminName ?? null,
      adminEmail: g.adminEmail ?? null,
      memberCount: memberCountMap.get(g.id) ?? 0,
      pendingInvitations: pendingInvitationMap.get(g.id) ?? 0,
      creatorName: g.adminName ?? undefined,
    }));

    return {
      groups: result,
    };
  }
}
