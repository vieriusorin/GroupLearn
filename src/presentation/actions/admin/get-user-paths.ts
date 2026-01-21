"use server";

import { and, asc, eq, or, sql } from "drizzle-orm";
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
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface PathWithAccess {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  visibility: string;
  domain_name: string;
  unit_count: number;
  isApproved: boolean;
  isCreated: boolean;
  isGroupAccessible: boolean;
  canAccess: boolean;
  accessType: "created" | "group" | "approved" | "public" | "none";
}

export interface UserPathsResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  paths: PathWithAccess[];
}

export async function getUserPaths(
  userId: string,
): Promise<ActionResult<UserPathsResponse>> {
  return withAuth(["admin"], async (_user) => {
    const [targetUser] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!targetUser) {
      return {
        success: false,
        error: "User not found",
        code: "NOT_FOUND",
      };
    }

    const targetUserIsAdmin = targetUser.role === "admin";

    const allPaths = await db
      .select({
        id: paths.id,
        name: paths.name,
        description: paths.description,
        icon: paths.icon,
        visibility: paths.visibility,
        domain_name: domains.name,
        unit_count: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${units}
          WHERE ${units.pathId} = ${paths.id}
        )`.as("unit_count"),
      })
      .from(paths)
      .innerJoin(domains, eq(paths.domainId, domains.id))
      .orderBy(asc(domains.name), asc(paths.orderIndex));

    const approvedPaths = await db
      .select({ path_id: pathApprovals.pathId })
      .from(pathApprovals)
      .where(eq(pathApprovals.userId, userId));

    const approvedPathIds = new Set(approvedPaths.map((p) => p.path_id));

    const createdPaths = await db
      .select({ id: paths.id })
      .from(paths)
      .where(eq(paths.createdBy, userId));

    const createdPathIds = new Set(createdPaths.map((p) => p.id));

    const groupPathsList = await db
      .selectDistinct({ path_id: groupPaths.pathId })
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
          eq(groupMembers.userId, userId),
          or(
            eq(groupPathVisibility.isVisible, true),
            sql`${groupPathVisibility.isVisible} IS NULL`,
          ),
        ),
      );

    const groupPathIds = new Set(groupPathsList.map((p) => p.path_id));

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

      return {
        ...path,
        visibility: path.visibility || "public",
        isApproved,
        isCreated,
        isGroupAccessible,
        canAccess,
        accessType,
      };
    });

    return {
      success: true,
      data: {
        user: {
          id: targetUser.id,
          name: targetUser.name || "",
          email: targetUser.email,
        },
        paths: pathsWithAccess,
      },
    };
  });
}
