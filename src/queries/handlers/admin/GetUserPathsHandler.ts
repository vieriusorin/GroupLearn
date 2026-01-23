import { and, asc, eq, or, sql } from "drizzle-orm";
import type { GetUserPathsResult } from "@/application/dtos/admin.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { db } from "@/infrastructure/database/drizzle";
import {
  domains,
  groupMembers,
  groupPaths,
  groupPathVisibility,
  pathApprovals,
  paths,
  units,
  users,
} from "@/infrastructure/database/schema";
import type { GetUserPathsQuery } from "@/queries/admin/GetUserPaths.query";

export class GetUserPathsHandler
  implements IQueryHandler<GetUserPathsQuery, GetUserPathsResult>
{
  async execute(query: GetUserPathsQuery): Promise<GetUserPathsResult> {
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, query.userId))
      .limit(1);

    if (!targetUser) {
      throw new DomainError("User not found", "NOT_FOUND");
    }

    const targetUserIsAdmin = targetUser.role === "admin";

    const allPaths = await db
      .select({
        id: paths.id,
        name: paths.name,
        description: paths.description,
        icon: paths.icon,
        visibility: paths.visibility,
        domainName: domains.name,
        unitCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${units}
          WHERE ${units.pathId} = ${paths.id}
        )`.as("unitCount"),
      })
      .from(paths)
      .innerJoin(domains, eq(paths.domainId, domains.id))
      .orderBy(asc(domains.name), asc(paths.orderIndex));

    const approvedPaths = await db
      .select({ pathId: pathApprovals.pathId })
      .from(pathApprovals)
      .where(eq(pathApprovals.userId, query.userId));

    const approvedPathIds = new Set(approvedPaths.map((p) => p.pathId));

    const createdPaths = await db
      .select({ id: paths.id })
      .from(paths)
      .where(eq(paths.createdBy, query.userId));

    const createdPathIds = new Set(createdPaths.map((p) => p.id));

    const groupPathsList = await db
      .selectDistinct({ pathId: groupPaths.pathId })
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
          eq(groupMembers.userId, query.userId),
          or(
            eq(groupPathVisibility.isVisible, true),
            sql`${groupPathVisibility.isVisible} IS NULL`,
          ),
        ),
      );

    const groupPathIds = new Set(groupPathsList.map((p) => p.pathId));

    const pathsWithAccess = allPaths.map((path) => {
      const isApproved = approvedPathIds.has(path.id);
      const isCreated = createdPathIds.has(path.id);
      const isGroupAccessible = groupPathIds.has(path.id);

      let canAccess: boolean;
      let accessType: "created" | "group" | "approved" | "public" | "none";

      if (targetUserIsAdmin) {
        canAccess = path.visibility === "public" || isCreated;
        accessType = isCreated
          ? "created"
          : path.visibility === "public"
            ? "public"
            : "none";
      } else {
        canAccess = isApproved || isCreated || isGroupAccessible;
        accessType = isCreated
          ? "created"
          : isGroupAccessible
            ? "group"
            : isApproved
              ? "approved"
              : "none";
      }

      const pathWithAccess: PathWithAccess = {
        id: path.id,
        name: path.name,
        description: path.description,
        icon: path.icon,
        visibility: path.visibility || "public",
        domainName: path.domainName || "",
        unitCount: path.unitCount || 0,
        isApproved,
        isCreated,
        isGroupAccessible,
        canAccess,
        accessType,
      };

      return pathWithAccess;
    });

    return {
      user: {
        id: targetUser.id,
        name: targetUser.name || "",
        email: targetUser.email,
      },
      paths: pathsWithAccess,
    };
  }
}
