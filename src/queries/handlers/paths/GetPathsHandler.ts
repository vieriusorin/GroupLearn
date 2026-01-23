import { and, asc, eq, inArray, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { PathWithProgress } from "@/application/dtos";
import type { GetPathsResult } from "@/application/dtos/learning-path.dto";
import type { IQueryHandler } from "@/commands/types";
import { db } from "@/infrastructure/database/drizzle";
import {
  groupMembers,
  groupPaths,
  groupPathVisibility,
  lessonCompletions,
  lessons,
  pathApprovals,
  paths,
  units,
  userProgress,
  users,
} from "@/infrastructure/database/schema";
import { CACHE_TAGS } from "@/lib/infrastructure/cache-tags";
import type { GetPathsQuery } from "@/queries/paths/GetPaths.query";

async function getVisiblePaths(userId?: string): Promise<any[]> {
  if (!userId) {
    const publicPaths = await db
      .select()
      .from(paths)
      .where(eq(paths.visibility, "public"))
      .orderBy(asc(paths.domainId), asc(paths.orderIndex));

    return publicPaths.map((p) => ({
      id: p.id,
      domainId: p.domainId,
      name: p.name,
      description: p.description,
      icon: p.icon,
      orderIndex: p.orderIndex,
      isLocked: p.isLocked,
      unlockRequirementType: p.unlockRequirementType,
      unlockRequirementValue: p.unlockRequirementValue,
      visibility: p.visibility,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
    }));
  }

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const isAdmin = user?.role === "admin";

  if (isAdmin) {
    const adminPaths = await db
      .select()
      .from(paths)
      .where(or(eq(paths.visibility, "public"), eq(paths.createdBy, userId)))
      .orderBy(asc(paths.domainId), asc(paths.orderIndex));

    return adminPaths.map((p) => ({
      id: p.id,
      domainId: p.domainId,
      name: p.name,
      description: p.description,
      icon: p.icon,
      orderIndex: p.orderIndex,
      isLocked: p.isLocked,
      unlockRequirementType: p.unlockRequirementType,
      unlockRequirementValue: p.unlockRequirementValue,
      visibility: p.visibility,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
    }));
  }

  const [approvedPaths, createdPaths, groupPathsResult] = await Promise.all([
    db
      .select({ pathId: pathApprovals.pathId })
      .from(pathApprovals)
      .where(eq(pathApprovals.userId, userId)),
    db.select({ id: paths.id }).from(paths).where(eq(paths.createdBy, userId)),
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
          eq(groupMembers.userId, userId),
          or(
            eq(groupPathVisibility.isVisible, true),
            sql`${groupPathVisibility.isVisible} IS NULL`,
          ),
        ),
      ),
  ]);

  const approvedIds = approvedPaths.map((p) => p.pathId);
  const createdIds = createdPaths.map((p) => p.id);
  const groupIds = groupPathsResult.map((p) => p.pathId);

  const allAccessiblePathIds = [
    ...new Set([...approvedIds, ...createdIds, ...groupIds]),
  ];

  if (allAccessiblePathIds.length === 0) {
    return [];
  }

  const accessiblePaths = await db
    .select()
    .from(paths)
    .where(inArray(paths.id, allAccessiblePathIds))
    .orderBy(asc(paths.domainId), asc(paths.orderIndex));

  return accessiblePaths.map((p) => ({
    id: p.id,
    domainId: p.domainId,
    name: p.name,
    description: p.description,
    icon: p.icon,
    orderIndex: p.orderIndex,
    isLocked: p.isLocked,
    unlockRequirementType: p.unlockRequirementType,
    unlockRequirementValue: p.unlockRequirementValue,
    visibility: p.visibility,
    createdBy: p.createdBy,
    createdAt: p.createdAt,
  }));
}

async function getVisiblePathsWithProgress(
  userId?: string,
): Promise<PathWithProgress[]> {
  const visiblePaths = await getVisiblePaths(userId);

  if (visiblePaths.length === 0) {
    return [];
  }

  const pathsWithProgress = await Promise.all(
    visiblePaths.map(async (path) => {
      const [counts] = await db
        .select({
          totalUnits: sql<number>`COUNT(DISTINCT ${units.id})`,
          totalLessons: sql<number>`COUNT(DISTINCT ${lessons.id})`,
        })
        .from(units)
        .leftJoin(lessons, eq(units.id, lessons.unitId))
        .where(eq(units.pathId, path.id));

      // Get completed lesson count for this user
      let completedLessons = 0;
      if (userId) {
        const [completed] = await db
          .select({
            count: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
          })
          .from(lessonCompletions)
          .innerJoin(lessons, eq(lessonCompletions.lessonId, lessons.id))
          .innerJoin(units, eq(lessons.unitId, units.id))
          .where(
            and(
              eq(units.pathId, path.id),
              eq(lessonCompletions.userId, userId),
            ),
          );
        completedLessons = Number(completed.count) || 0;
      }

      let progress = null;
      if (userId) {
        const [prog] = await db
          .select()
          .from(userProgress)
          .where(
            and(
              eq(userProgress.pathId, path.id),
              eq(userProgress.userId, userId),
            ),
          )
          .limit(1);
        progress = prog;
      }

      const totalLessons = Number(counts.totalLessons) || 0;
      const completionPercent =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        ...path,
        totalUnits: Number(counts.totalUnits) || 0,
        totalLessons: totalLessons,
        completedLessons: completedLessons,
        completionPercent: completionPercent,
        totalXp: progress?.totalXp || 0,
        completedUnits: 0, // TODO: Calculate completed units
        isUnlocked: !path.isLocked, // TODO: Check unlock requirements
      };
    }),
  );

  return pathsWithProgress;
}

async function getVisiblePathsByDomainWithProgress(
  domainId: number,
  userId?: string,
): Promise<PathWithProgress[]> {
  const allPaths = await getVisiblePathsWithProgress(userId);
  return allPaths.filter((p) => p.domainId === domainId);
}

const getCachedVisiblePathsWithProgress = unstable_cache(
  getVisiblePathsWithProgress,
  ["paths-with-progress"],
  {
    tags: [CACHE_TAGS.paths],
  },
);

const getCachedVisiblePathsByDomainWithProgress = unstable_cache(
  getVisiblePathsByDomainWithProgress,
  ["paths-by-domain-with-progress"],
  {
    tags: [CACHE_TAGS.paths],
  },
);

export class GetPathsHandler
  implements IQueryHandler<GetPathsQuery, GetPathsResult>
{
  async execute(query: GetPathsQuery): Promise<GetPathsResult> {
    let paths: PathWithProgress[];

    if (query.domainId) {
      paths = await getCachedVisiblePathsByDomainWithProgress(
        query.domainId,
        query.userId,
      );
    } else {
      paths = await getCachedVisiblePathsWithProgress(query.userId);
    }

    return {
      paths,
    };
  }
}
