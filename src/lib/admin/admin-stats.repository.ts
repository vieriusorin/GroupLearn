import { desc, eq, sql } from "drizzle-orm";
import type {
  AdminDashboardData,
  AdminStats,
  RecentDomain,
} from "@/application/dtos/admin.dto";
import { db } from "@/infrastructure/database/drizzle";
import {
  categories,
  domains,
  flashcards,
  groupMembers,
  groups,
  paths,
  users,
} from "@/infrastructure/database/schema";
import type { RecentGroup } from "@/types/admin";

export class AdminStatsRepository {
  static async getStats(): Promise<AdminStats> {
    const [
      domainsCount,
      categoriesCount,
      flashcardsCount,
      pathsCount,
      groupsCount,
      usersCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(domains),
      db.select({ count: sql<number>`COUNT(*)` }).from(categories),
      db.select({ count: sql<number>`COUNT(*)` }).from(flashcards),
      db.select({ count: sql<number>`COUNT(*)` }).from(paths),
      db.select({ count: sql<number>`COUNT(*)` }).from(groups),
      db.select({ count: sql<number>`COUNT(*)` }).from(users),
    ]);

    return {
      domains: Number(domainsCount[0].count) || 0,
      categories: Number(categoriesCount[0].count) || 0,
      flashcards: Number(flashcardsCount[0].count) || 0,
      paths: Number(pathsCount[0].count) || 0,
      groups: Number(groupsCount[0].count) || 0,
      users: Number(usersCount[0].count) || 0,
    };
  }

  static async getRecentGroups(limit: number = 5): Promise<RecentGroup[]> {
    const recentGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        createdAt: groups.createdAt,
        adminName: users.name,
        memberCount: sql<number>`(SELECT COUNT(*) FROM ${groupMembers} WHERE ${groupMembers.groupId} = ${groups.id})`,
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id))
      .orderBy(desc(groups.createdAt))
      .limit(limit);

    return recentGroups.map((g) => ({
      id: g.id,
      name: g.name,
      createdAt: g.createdAt.toISOString(),
      adminName: g.adminName || null,
      memberCount: Number(g.memberCount) || 0,
    }));
  }

  static async getRecentDomains(limit: number = 5): Promise<RecentDomain[]> {
    // Note: domains table doesn't have created_by field in current schema
    // Using left join in case it's added later
    const recentDomains = await db
      .select({
        id: domains.id,
        name: domains.name,
        createdAt: domains.createdAt,
        categoryCount: sql<number>`(SELECT COUNT(*) FROM ${categories} WHERE ${categories.domainId} = ${domains.id})`,
      })
      .from(domains)
      .orderBy(desc(domains.createdAt))
      .limit(limit);

    return recentDomains.map((d) => ({
      id: d.id,
      name: d.name,
      createdAt: d.createdAt.toISOString(),
      creatorName: null, // Domain schema doesn't have created_by field
      categoryCount: Number(d.categoryCount) || 0,
    }));
  }

  static async getDashboardData(): Promise<AdminDashboardData> {
    const [stats, recentGroups, recentDomains] = await Promise.all([
      AdminStatsRepository.getStats(),
      AdminStatsRepository.getRecentGroups(5),
      AdminStatsRepository.getRecentDomains(5),
    ]);

    return {
      stats,
      recentGroups,
      recentDomains,
    };
  }
}
