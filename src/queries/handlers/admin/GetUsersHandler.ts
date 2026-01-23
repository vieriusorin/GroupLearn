import { and, desc, eq, or, sql } from "drizzle-orm";
import type { GetUsersResult } from "@/application/dtos/admin.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
  pathApprovals,
  paths,
  users,
} from "@/infrastructure/database/schema";
import type { GetUsersQuery } from "@/queries/admin/GetUsers.query";

export class GetUsersHandler
  implements IQueryHandler<GetUsersQuery, GetUsersResult>
{
  async execute(_query: GetUsersQuery): Promise<GetUsersResult> {
    const usersList = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        approvedPathsCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${pathApprovals}
          WHERE ${pathApprovals.userId} = ${sql.raw('"users"."id"')}
        )`.as("approvedPathsCount"),
        groupsCount: sql<number>`(
          SELECT COUNT(*)
          FROM ${groupMembers}
          WHERE ${groupMembers.userId} = ${sql.raw('"users"."id"')}
        )`.as("groupsCount"),
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
        const approvedCount = userRecord.approvedPathsCount || 0;

        const totalAccessiblePaths =
          approvedCount + createdCount + groupAccessibleCount;

        const adminUser: AdminUser = {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
          role: userRecord.role,
          createdAt: userRecord.createdAt.toISOString(),
          approvedPathsCount: approvedCount,
          groupsCount: userRecord.groupsCount || 0,
          groupAccessiblePathsCount: groupAccessibleCount,
          createdPathsCount: createdCount,
          totalAccessiblePaths: totalAccessiblePaths,
        };

        return adminUser;
      }),
    );

    return {
      users: usersWithAccess,
    };
  }
}
