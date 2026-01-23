import { and, count, desc, eq, inArray } from "drizzle-orm";
import type {
  GetAssignedPathsResult,
  GroupPathListItem,
} from "@/application/dtos/groups.dto";
import type { IQueryHandler } from "@/commands/types";
import { DomainError } from "@/domains/shared/errors";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { domains } from "@/infrastructure/database/schema/content.schema";
import { PathVisibility } from "@/infrastructure/database/schema/enums";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
} from "@/infrastructure/database/schema/groups.schema";
import {
  paths,
  units,
} from "@/infrastructure/database/schema/learning-path.schema";
import { getDb } from "@/lib/infrastructure/db";
import type { GetAssignedPathsQuery } from "@/queries/groups/GetAssignedPaths.query";

export class GetAssignedPathsHandler
  implements IQueryHandler<GetAssignedPathsQuery, GetAssignedPathsResult>
{
  async execute(query: GetAssignedPathsQuery): Promise<GetAssignedPathsResult> {
    const db = getDb();

    const [membership] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, query.groupId),
          eq(groupMembers.userId, query.userId),
        ),
      );

    const [userRecord] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, query.userId))
      .limit(1);

    if (!userRecord || (userRecord.role !== "admin" && !membership)) {
      throw new DomainError(
        "You do not have permission to view this group",
        "FORBIDDEN",
      );
    }

    const isAdmin = userRecord.role === "admin" || membership?.role === "admin";

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
      .where(eq(groupPaths.groupId, query.groupId))
      .orderBy(desc(groupPaths.assignedAt));

    if (baseRows.length === 0) {
      return {
        paths: [],
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
          eq(groupPathVisibility.groupId, query.groupId),
          inArray(groupPathVisibility.pathId, pathIds),
        ),
      );

    const visibilityMap = new Map<string, boolean>();
    visibilityRows.forEach((row) => {
      visibilityMap.set(`${row.groupId}:${row.pathId}`, row.isVisible);
    });

    const result: GroupPathListItem[] = baseRows
      .map((row) => {
        const visibilityKey = `${query.groupId}:${row.pathId}`;
        const overrideVisible = visibilityMap.get(visibilityKey);
        const effectiveVisible = overrideVisible ?? true;

        return {
          id: row.id,
          name: row.name,
          description: row.description,
          domainId: row.domainId,
          domainName: row.domainName ?? null,
          isPublic: row.visibility === PathVisibility.PUBLIC,
          unitCount: unitCountMap.get(row.pathId) ?? 0,
          assignedAt: row.assignedAt.toISOString(),
          assignedBy: row.assignedBy,
          assignedByName: row.assignedByName ?? null,
          isVisible: effectiveVisible,
        };
      })
      .filter((path) => (isAdmin ? true : path.isVisible));

    return {
      paths: result,
    };
  }
}
