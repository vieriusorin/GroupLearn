import type { Path, User } from "@/infrastructure/database/schema";

export type AdminUser = Pick<User, "id" | "name" | "email" | "role"> & {
  createdAt: string; // ISO string from User.createdAt
  approvedPathsCount: number;
  groupsCount: number;
  groupAccessiblePathsCount?: number;
  createdPathsCount?: number;
  totalAccessiblePaths?: number;
};

export type PathWithAccess = Pick<
  Path,
  "id" | "name" | "description" | "icon" | "visibility"
> & {
  domainName: string;
  unitCount: number;
  isApproved: boolean;
  isCreated: boolean;
  isGroupAccessible: boolean;
  canAccess: boolean;
  accessType: "created" | "group" | "approved" | "public" | "none";
};

export type UserPathsResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  paths: PathWithAccess[];
};

/**
 * Admin stats
 */
export type AdminStats = {
  domains: number;
  categories: number;
  flashcards: number;
  paths: number;
  groups: number;
  users: number;
};

/**
 * Recent domain for admin dashboard
 */
export type RecentDomain = {
  id: number;
  name: string;
  createdAt: string; // ISO string
  creatorName: string | null;
  categoryCount: number;
};

/**
 * Admin dashboard data
 */
export type AdminDashboardData = {
  stats: AdminStats;
  recentGroups: Array<{
    id: number;
    name: string;
    createdAt: string; // ISO string
    adminName: string | null;
    memberCount: number;
  }>;
  recentDomains: RecentDomain[];
};

/**
 * Get admin stats result
 * Returned when fetching admin dashboard statistics
 */
export type GetAdminStatsResult = {
  dashboardData: AdminDashboardData;
};

/**
 * Get users result
 * Returned when fetching all users for admin
 */
export type GetUsersResult = {
  users: AdminUser[];
};

/**
 * Get user paths result
 * Returned when fetching user path access
 */
export type GetUserPathsResult = UserPathsResponse;
