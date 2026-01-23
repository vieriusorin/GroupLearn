import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  categories,
  domains,
  groupMembers,
  groupPaths,
  groupPathVisibility,
  pathApprovals,
  paths,
} from "@/infrastructure/database/schema";
import { requireAuth } from "./rbac";

export async function canAccessDomain(_domainId: number): Promise<boolean> {
  const _user = await requireAuth();

  return true;
}

export async function canModifyDomain(_domainId: number): Promise<boolean> {
  const user = await requireAuth();

  return user.role === "admin";
}

export async function canAccessCategory(_categoryId: number): Promise<boolean> {
  const _user = await requireAuth();

  return true;
}

export async function canModifyCategory(_categoryId: number): Promise<boolean> {
  const user = await requireAuth();

  return user.role === "admin";
}

export async function canAccessFlashcard(
  _flashcardId: number,
): Promise<boolean> {
  const _user = await requireAuth();

  return true;
}

export async function canModifyFlashcard(
  _flashcardId: number,
): Promise<boolean> {
  const user = await requireAuth();

  return user.role === "admin";
}

export async function canAccessPath(pathId: number): Promise<boolean> {
  const user = await requireAuth();

  if (user.role === "admin") return true;

  const [path] = await db
    .select({
      createdBy: paths.createdBy,
      visibility: paths.visibility,
    })
    .from(paths)
    .where(eq(paths.id, pathId))
    .limit(1);

  if (!path) {
    return false;
  }

  if (path.createdBy === user.id) {
    return true;
  }

  const memberships = await db
    .select({ groupId: groupMembers.groupId })
    .from(groupMembers)
    .where(eq(groupMembers.userId, user.id));

  if (memberships.length > 0) {
    const groupIds = memberships.map((m) => m.groupId);

    const visibleGroupPath = await db
      .select({ pathId: groupPaths.pathId })
      .from(groupPaths)
      .leftJoin(
        groupPathVisibility,
        and(
          eq(groupPaths.groupId, groupPathVisibility.groupId),
          eq(groupPaths.pathId, groupPathVisibility.pathId),
        ),
      )
      .where(
        and(
          eq(groupPaths.pathId, pathId),
          inArray(groupPaths.groupId, groupIds),
          or(
            eq(groupPathVisibility.isVisible, true),
            sql`${groupPathVisibility.isVisible} IS NULL`,
          ),
        ),
      )
      .limit(1);

    if (visibleGroupPath.length > 0) {
      return true;
    }
  }

  const [approval] = await db
    .select({ id: pathApprovals.id })
    .from(pathApprovals)
    .where(
      and(eq(pathApprovals.pathId, pathId), eq(pathApprovals.userId, user.id)),
    )
    .limit(1);

  if (approval) {
    return true;
  }

  return false;
}

export async function canModifyPath(pathId: number): Promise<boolean> {
  const user = await requireAuth();

  if (user.role === "admin") return true;

  const [path] = await db
    .select({ createdBy: paths.createdBy })
    .from(paths)
    .where(eq(paths.id, pathId))
    .limit(1);

  if (!path) return false;

  return path.createdBy === user.id;
}

export async function canModifyLesson(_lessonId: number): Promise<boolean> {
  const user = await requireAuth();
  return user.role === "admin";
}

export async function canModifyUnit(_unitId: number): Promise<boolean> {
  const user = await requireAuth();

  return user.role === "admin";
}

export async function getAccessibleDomainsForUser(): Promise<any[]> {
  // All users see all domains with category counts
  const domainsWithCounts = await db
    .select({
      id: domains.id,
      name: domains.name,
      description: domains.description,
      createdAt: domains.createdAt,
      categoryCount: sql<number>`COUNT(${categories.id})`,
    })
    .from(domains)
    .leftJoin(categories, eq(domains.id, categories.domainId))
    .groupBy(domains.id)
    .orderBy(domains.createdAt);

  return domainsWithCounts.map((d) => ({
    ...d,
    category_count: Number(d.categoryCount) || 0,
  }));
}

export async function getAccessibleDomains(): Promise<any[]> {
  await requireAuth();
  return getAccessibleDomainsForUser();
}

export async function getAccessiblePaths(domainId?: number): Promise<any[]> {
  const user = await requireAuth();

  if (user.role === "admin") {
    const query = db.select().from(paths).orderBy(paths.orderIndex);

    if (domainId) {
      const pathsList = await query.where(eq(paths.domainId, domainId));
      return pathsList;
    }

    return await query;
  }
  const [createdPaths, approvedPaths, groupPathIds] = await Promise.all([
    db.select({ id: paths.id }).from(paths).where(eq(paths.createdBy, user.id)),
    db
      .select({ pathId: pathApprovals.pathId })
      .from(pathApprovals)
      .where(eq(pathApprovals.userId, user.id)),
    db
      .select({ pathId: groupPaths.pathId })
      .from(groupPaths)
      .innerJoin(groupMembers, eq(groupPaths.groupId, groupMembers.groupId))
      .leftJoin(
        groupPathVisibility,
        and(
          eq(groupPaths.groupId, groupPathVisibility.groupId),
          eq(groupPaths.pathId, groupPathVisibility.pathId),
        ),
      )
      .where(
        and(
          eq(groupMembers.userId, user.id),
          or(
            eq(groupPathVisibility.isVisible, true),
            sql`${groupPathVisibility.isVisible} IS NULL`,
          ),
        ),
      ),
  ]);

  const createdIds = createdPaths.map((p) => p.id);
  const approvedIds = approvedPaths.map((p) => p.pathId);
  const groupIds = groupPathIds.map((p) => p.pathId);

  const allAccessiblePathIds = [
    ...new Set([...createdIds, ...approvedIds, ...groupIds]),
  ];

  if (allAccessiblePathIds.length === 0) {
    return [];
  }

  const query = db
    .select()
    .from(paths)
    .where(inArray(paths.id, allAccessiblePathIds))
    .orderBy(paths.orderIndex);

  if (domainId) {
    const pathsList = await db
      .select()
      .from(paths)
      .where(
        and(
          inArray(paths.id, allAccessiblePathIds),
          eq(paths.domainId, domainId),
        ),
      )
      .orderBy(paths.orderIndex);
    return pathsList;
  }

  return await query;
}
