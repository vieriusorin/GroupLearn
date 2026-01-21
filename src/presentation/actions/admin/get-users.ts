"use server";

import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
  pathApprovals,
  paths,
  users,
} from "@/infrastructure/database/schema";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  created_at: string;
  approved_paths_count: number;
  groups_count: number;
  group_accessible_paths_count?: number;
  created_paths_count?: number;
  total_accessible_paths?: number;
}

export async function getUsers(): Promise<ActionResult<AdminUser[]>> {
  return withAuth(["admin"], async (_user) => {
    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.createdAt,
        approved_paths_count: sql<number>`(
          SELECT COUNT(*)
          FROM ${pathApprovals}
          WHERE ${pathApprovals.userId} = ${sql.raw('"users"."id"')}
        )`.as("approved_paths_count"),
        groups_count: sql<number>`(
          SELECT COUNT(*)
          FROM ${groupMembers}
          WHERE ${groupMembers.userId} = ${sql.raw('"users"."id"')}
        )`.as("groups_count"),
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    const usersWithAccess = await Promise.all(
      usersList.map(async (userRecord) => {
        const [groupAccessiblePaths] = await db
          .select({
            count: sql<number>`COUNT(DISTINCT ${groupPaths.pathId})`.as(
              "count",
            ),
          })
          .from(groupPaths)
          .innerJoin(groupMembers, eq(groupPaths.groupId, groupMembers.groupId))
          .leftJoin(
            groupPathVisibility,
            and(
              eq(groupPathVisibility.groupId, groupPaths.groupId),
              eq(groupPathVisibility.pathId, groupPaths.pathId),
            ),
          )
          .where(
            and(
              eq(groupMembers.userId, userRecord.id),
              or(
                eq(groupPathVisibility.isVisible, true),
                sql`${groupPathVisibility.isVisible} IS NULL`,
              ),
            ),
          );

        const [createdPaths] = await db
          .select({ count: sql<number>`COUNT(*)`.as("count") })
          .from(paths)
          .where(eq(paths.createdBy, userRecord.id));

        const groupAccessibleCount = groupAccessiblePaths?.count || 0;
        const createdCount = createdPaths?.count || 0;
        const approvedCount = userRecord.approved_paths_count || 0;

        const totalAccessiblePaths =
          approvedCount + createdCount + groupAccessibleCount;

        return {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          created_at: userRecord.created_at.toISOString(),
          approved_paths_count: approvedCount,
          groups_count: userRecord.groups_count || 0,
          group_accessible_paths_count: groupAccessibleCount,
          created_paths_count: createdCount,
          total_accessible_paths: totalAccessiblePaths,
        };
      }),
    );

    return {
      success: true,
      data: usersWithAccess,
    };
  });
}
