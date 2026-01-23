import { count, desc, eq, inArray } from "drizzle-orm";
import type { GetMyGroupsResult } from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import {
  groupMembers,
  groupPaths,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import { getDb } from "@/lib/infrastructure/db";
import type { GetMyGroupsQuery } from "@/queries/groups/GetMyGroups.query";

export class GetMyGroupsHandler
  implements IQueryHandler<GetMyGroupsQuery, GetMyGroupsResult>
{
  async execute(query: GetMyGroupsQuery): Promise<GetMyGroupsResult> {
    const db = getDb();

    const baseGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdAt: groups.createdAt,
        role: groupMembers.role,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, query.userId))
      .orderBy(desc(groups.createdAt));

    if (baseGroups.length === 0) {
      return {
        groups: [],
      };
    }

    const groupIds = baseGroups.map((g) => g.id);

    const memberCounts = await db
      .select({
        groupId: groupMembers.groupId,
        count: count(),
      })
      .from(groupMembers)
      .where(inArray(groupMembers.groupId, groupIds))
      .groupBy(groupMembers.groupId);

    const memberCountMap = new Map<number, number>();
    memberCounts.forEach((row) => {
      memberCountMap.set(row.groupId, Number(row.count ?? 0));
    });

    const pathCounts = await db
      .select({
        groupId: groupPaths.groupId,
        count: count(),
      })
      .from(groupPaths)
      .where(inArray(groupPaths.groupId, groupIds))
      .groupBy(groupPaths.groupId);

    const pathCountMap = new Map<number, number>();
    pathCounts.forEach((row) => {
      pathCountMap.set(row.groupId, Number(row.count ?? 0));
    });

    const result: MyGroupListItem[] = baseGroups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      role: g.role as "member" | "admin",
      memberCount: memberCountMap.get(g.id) ?? 0,
      pathCount: pathCountMap.get(g.id) ?? 0,
      createdAt: g.createdAt.toISOString(),
    }));

    return {
      groups: result,
    };
  }
}
