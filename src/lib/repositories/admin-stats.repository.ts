/**
 * Admin Statistics Repository
 * Handles data fetching for admin dashboard
 */

import { desc, eq, sql } from "drizzle-orm";
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
import type {
  AdminDashboardData,
  AdminStats,
  RecentDomain,
  RecentGroup,
} from "@/types/admin";

export class AdminStatsRepository {
  /**
   * Get platform statistics
   */
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

  /**
   * Get recent groups with admin info
   */
  static async getRecentGroups(limit: number = 5): Promise<RecentGroup[]> {
    const recentGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        created_at: groups.createdAt,
        admin_name: users.name,
        member_count: sql<number>`(SELECT COUNT(*) FROM ${groupMembers} WHERE ${groupMembers.groupId} = ${groups.id})`,
      })
      .from(groups)
      .innerJoin(users, eq(groups.adminId, users.id))
      .orderBy(desc(groups.createdAt))
      .limit(limit);

    return recentGroups.map((g) => ({
      id: g.id,
      name: g.name,
      created_at: g.created_at.toISOString(),
      admin_name: g.admin_name || "Unknown",
      member_count: Number(g.member_count) || 0,
    }));
  }

  /**
   * Get recent domains with creator info
   */
  static async getRecentDomains(limit: number = 5): Promise<RecentDomain[]> {
    // Note: domains table doesn't have created_by field in current schema
    // Using left join in case it's added later
    const recentDomains = await db
      .select({
        id: domains.id,
        name: domains.name,
        created_at: domains.createdAt,
        category_count: sql<number>`(SELECT COUNT(*) FROM ${categories} WHERE ${categories.domainId} = ${domains.id})`,
      })
      .from(domains)
      .orderBy(desc(domains.createdAt))
      .limit(limit);

    return recentDomains.map((d) => ({
      id: d.id,
      name: d.name,
      created_at: d.created_at.toISOString(),
      creator_name: null, // Domain schema doesn't have created_by field
      category_count: Number(d.category_count) || 0,
    }));
  }

  /**
   * Get all dashboard data in one call
   */
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
