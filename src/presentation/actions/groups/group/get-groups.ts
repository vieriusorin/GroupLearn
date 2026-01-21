"use server";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema/auth.schema";
import {
  groupMembers,
  groups,
} from "@/infrastructure/database/schema/groups.schema";
import { isAdmin } from "@/lib/rbac";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface GroupListItem {
  id: number;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  creator_name?: string;
  admin_name?: string;
  member_count?: number;
  pending_invitations?: number;
}

export async function getGroups(): Promise<ActionResult<GroupListItem[]>> {
  return withAuth(["admin", "member"], async (user) => {
    const userIsAdmin = await isAdmin();

    if (userIsAdmin) {
      const groupsList = await db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,
          created_by: groups.adminId,
          created_at: sql<string>`${groups.createdAt}::text`.as("created_at"),
          admin_name: users.name,
          admin_email: users.email,
          member_count: sql<number>`(
            SELECT COUNT(*)::int
            FROM ${groupMembers}
            WHERE ${groupMembers.groupId} = ${groups.id}
          )`.as("member_count"),
        })
        .from(groups)
        .innerJoin(users, eq(groups.adminId, users.id))
        .orderBy(desc(groups.createdAt));

      return {
        success: true,
        data: groupsList.map((g) => ({
          ...g,
          admin_name: g.admin_name ?? undefined,
          created_at: g.created_at || new Date().toISOString(),
        })),
      };
    } else {
      const groupsList = await db
        .select({
          id: groups.id,
          name: groups.name,
          description: groups.description,
          created_by: groups.adminId,
          created_at: sql<string>`${groups.createdAt}::text`.as("created_at"),
          admin_name: users.name,
          admin_email: users.email,
          member_count: sql<number>`(
            SELECT COUNT(*)::int
            FROM ${groupMembers}
            WHERE ${groupMembers.groupId} = ${groups.id}
          )`.as("member_count"),
        })
        .from(groups)
        .innerJoin(users, eq(groups.adminId, users.id))
        .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
        .where(eq(groupMembers.userId, user.id))
        .orderBy(desc(groups.createdAt));

      return {
        success: true,
        data: groupsList.map((g) => ({
          ...g,
          admin_name: g.admin_name ?? undefined,
          created_at: g.created_at || new Date().toISOString(),
        })),
      };
    }
  });
}
