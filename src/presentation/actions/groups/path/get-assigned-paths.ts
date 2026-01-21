"use server";

import { and, count, desc, eq, inArray } from "drizzle-orm";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { domains } from "@/infrastructure/database/schema/content.schema";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import {
  paths,
  units,
} from "@/infrastructure/database/schema/learning-path.schema";
import { getDb } from "@/lib/db";
import type { ActionResult } from "@/presentation/types/action-result";
import { withAuth } from "@/presentation/utils/action-wrapper";

export interface GroupPath {
  id: number;
  name: string;
  description: string | null;
  domain_id: number;
  domain_name?: string;
  is_public: number;
  unit_count?: number;
  assigned_at: string;
  assigned_by: string;
  assigned_by_name: string | null;
  is_visible: number;
}

export async function getAssignedPaths(
  groupId: number,
): Promise<ActionResult<GroupPath[]>> {
  return withAuth(["admin", "member"], async (user) => {
    const db = getDb();

    try {
      const [membership] = await db
        .select({ role: groupMembers.role })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, user.id),
          ),
        );

      if (user.role !== "admin" && !membership) {
        return {
          success: false,
          error: "You do not have permission to view this group",
        };
      }

      const isAdmin = user.role === "admin" || membership?.role === "admin";

      const baseRows = await db
        .select({
          id: paths.id,
          name: paths.name,
          description: paths.description,
          domainId: paths.domainId,
          domainName: domains.name,
          visibility: paths.visibility,
          assignedAt: groupPaths.assignedAt,
          assignedBy: groupPaths.assignedBy,
          assignedByName: users.name,
          pathId: paths.id,
        })
        .from(groupPaths)
        .innerJoin(paths, eq(groupPaths.pathId, paths.id))
        .leftJoin(domains, eq(paths.domainId, domains.id))
        .leftJoin(users, eq(groupPaths.assignedBy, users.id))
        .where(eq(groupPaths.groupId, groupId))
        .orderBy(desc(groupPaths.assignedAt));

      if (baseRows.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      const pathIds = baseRows.map((row) => row.pathId);

      const unitCounts = await db
        .select({
          pathId: units.pathId,
          count: count(),
        })
        .from(units)
        .where(inArray(units.pathId, pathIds))
        .groupBy(units.pathId);

      const unitCountMap = new Map<number, number>();
      unitCounts.forEach((row) => {
        unitCountMap.set(row.pathId, Number(row.count ?? 0));
      });

      const visibilityRows = await db
        .select({
          groupId: groupPathVisibility.groupId,
          pathId: groupPathVisibility.pathId,
          isVisible: groupPathVisibility.isVisible,
        })
        .from(groupPathVisibility)
        .where(
          and(
            eq(groupPathVisibility.groupId, groupId),
            inArray(groupPathVisibility.pathId, pathIds),
          ),
        );

      const visibilityMap = new Map<string, boolean>();
      visibilityRows.forEach((row) => {
        visibilityMap.set(`${row.groupId}:${row.pathId}`, row.isVisible);
      });

      const result: GroupPath[] = baseRows
        .map((row) => {
          const visibilityKey = `${groupId}:${row.pathId}`;
          const overrideVisible = visibilityMap.get(visibilityKey);
          const effectiveVisible = overrideVisible ?? true;

          return {
            id: row.id,
            name: row.name,
            description: row.description,
            domain_id: row.domainId,
            domain_name: row.domainName ?? undefined,
            is_public: row.visibility === "public" ? 1 : 0,
            unit_count: unitCountMap.get(row.pathId) ?? 0,
            assigned_at: row.assignedAt.toISOString(),
            assigned_by: row.assignedBy,
            assigned_by_name: row.assignedByName ?? null,
            is_visible: effectiveVisible ? 1 : 0,
          };
        })
        .filter((path) => (isAdmin ? true : path.is_visible === 1));
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Error fetching assigned paths:", error);
      return {
        success: false,
        error: "Failed to fetch assigned paths",
      };
    }
  });
}
