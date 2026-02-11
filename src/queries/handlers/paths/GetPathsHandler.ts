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

      // Calculate completed units (units where all lessons are completed)
      let completedUnits = 0;
      if (userId) {
        const pathUnits = await db
          .select({
            unitId: units.id,
            totalLessons: sql<number>`COUNT(DISTINCT ${lessons.id})`,
            completedLessons: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
          })
          .from(units)
          .leftJoin(lessons, eq(units.id, lessons.unitId))
          .leftJoin(
            lessonCompletions,
            and(
              eq(lessons.id, lessonCompletions.lessonId),
              eq(lessonCompletions.userId, userId),
            ),
          )
          .where(eq(units.pathId, path.id))
          .groupBy(units.id);

        completedUnits = pathUnits.filter(
          (unit) =>
            Number(unit.totalLessons) > 0 &&
            Number(unit.completedLessons) === Number(unit.totalLessons),
        ).length;
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

      // Check unlock requirements
      let isUnlocked = !path.isLocked;
      if (path.isLocked && userId && path.unlockRequirementType) {
        if (path.unlockRequirementType === "xp") {
          // Check if user has enough total XP
          const requiredXp = Number(path.unlockRequirementValue) || 0;
          const userTotalXp = progress?.totalXp || 0;
          isUnlocked = userTotalXp >= requiredXp;
        } else if (path.unlockRequirementType === "admin") {
          // Check if user has admin approval for this path
          const [approval] = await db
            .select()
            .from(pathApprovals)
            .where(
              and(
                eq(pathApprovals.pathId, path.id),
                eq(pathApprovals.userId, userId),
              ),
            )
            .limit(1);
          isUnlocked = !!approval;
        } else if (path.unlockRequirementType === "sequential") {
          // For sequential unlock, check if previous path is completed
          // Previous path would be the one with orderIndex = current - 1 in same domain
          const [previousPath] = await db
            .select({
              id: paths.id,
              totalLessons: sql<number>`COUNT(DISTINCT ${lessons.id})`,
              completedLessons: sql<number>`COUNT(DISTINCT ${lessonCompletions.lessonId})`,
            })
            .from(paths)
            .leftJoin(units, eq(paths.id, units.pathId))
            .leftJoin(lessons, eq(units.id, lessons.unitId))
            .leftJoin(
              lessonCompletions,
              and(
                eq(lessons.id, lessonCompletions.lessonId),
                eq(lessonCompletions.userId, userId),
              ),
            )
            .where(
              and(
                eq(paths.domainId, path.domainId),
                sql`${paths.orderIndex} < ${path.orderIndex}`,
              ),
            )
            .groupBy(paths.id)
            .orderBy(sql`${paths.orderIndex} DESC`)
            .limit(1);

          if (previousPath) {
            const totalLessons = Number(previousPath.totalLessons) || 0;
            const completedLessons = Number(previousPath.completedLessons) || 0;
            isUnlocked = totalLessons > 0 && completedLessons >= totalLessons;
          } else {
            // No previous path, so this should be unlocked
            isUnlocked = true;
          }
        }
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
        completedUnits: completedUnits,
        isUnlocked: isUnlocked,
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
