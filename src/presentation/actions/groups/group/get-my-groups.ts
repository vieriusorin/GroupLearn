"use server";

import { count, desc, eq, inArray } from "drizzle-orm";
import {
  groupMembers,
  groupPaths,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import { getDb } from "@/lib/db";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface MyGroupListItem {
  id: number;
  name: string;
  description: string | null;
  role: "member" | "admin";
  member_count: number;
  path_count: number;
  created_at: string;
}

export async function getMyGroups(): Promise<ActionResult<MyGroupListItem[]>> {
  return withAuth(["admin", "member"], async (user) => {
    const db = getDb();

    // First, load the groups where the current user is a member
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
      .where(eq(groupMembers.userId, user.id))
      .orderBy(desc(groups.createdAt));

    if (baseGroups.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const groupIds = baseGroups.map((g) => g.id);

    // Member counts per group
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

    // Path counts per group
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
      member_count: memberCountMap.get(g.id) ?? 0,
      path_count: pathCountMap.get(g.id) ?? 0,
      created_at: g.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: result,
    };
  });
}
