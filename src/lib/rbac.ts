import { auth } from "./auth";

/**
 * Role-Based Access Control (RBAC) Utilities
 *
 * Provides functions to check user roles and permissions
 */

export type UserRole = "admin" | "member" | "guest";
export type SubscriptionStatus = "free" | "paid" | "trial";

/**
 * Get the current user's session including role
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return session.user.role === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if the current user is a member (paid or free)
 */
export async function isMember(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return session.user.role === "member" || session.user.role === "admin";
}

/**
 * Check if the current user has a paid subscription
 */
export async function hasPaidSubscription(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // Admin always has access
  if (session.user.role === "admin") return true;

  // Check subscription status
  if (
    session.user.subscriptionStatus !== "paid" &&
    session.user.subscriptionStatus !== "trial"
  ) {
    return false;
  }

  // Check if subscription is expired
  if (session.user.subscriptionExpiresAt) {
    const expiresAt = new Date(session.user.subscriptionExpiresAt);
    return expiresAt > new Date();
  }

  return true;
}

/**
 * Require authentication - throw error if not authenticated
 * Use in API routes
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/**
 * Require specific role - throw error if user doesn't have role
 * Use in API routes
 */
export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }
  return user;
}

/**
 * Require admin role - throw error if not admin
 * Use in API routes
 */
export async function requireAdmin() {
  return requireRole("admin");
}

/**
 * Require paid subscription - throw error if no active subscription
 * Use in API routes
 */
export async function requirePaidSubscription() {
  const user = await requireAuth();

  // Admin always has access
  if (user.role === "admin") return user;

  // Check subscription status
  if (
    user.subscriptionStatus !== "paid" &&
    user.subscriptionStatus !== "trial"
  ) {
    throw new Error("Paid subscription required");
  }

  // Check if subscription is expired
  if (user.subscriptionExpiresAt) {
    const expiresAt = new Date(user.subscriptionExpiresAt);
    if (expiresAt <= new Date()) {
      throw new Error("Subscription expired");
    }
  }

  return user;
}

/**
 * Check if user can perform action based on role
 * Use for fine-grained permission checks
 */
export async function can(action: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const role = session.user.role;

  // Define permissions per role
  const permissions: Record<UserRole, string[]> = {
    admin: [
      "create:domain",
      "edit:domain",
      "delete:domain",
      "create:category",
      "edit:category",
      "delete:category",
      "create:flashcard",
      "edit:flashcard",
      "delete:flashcard",
      "create:path",
      "edit:path",
      "delete:path",
      "create:group",
      "edit:group",
      "delete:group",
      "invite:members",
      "remove:members",
      "view:analytics",
      "manage:users",
    ],
    member: ["view:content", "complete:lesson", "view:progress", "join:group"],
    guest: ["view:public"],
  };

  return permissions[role]?.includes(action) || false;
}

/**
 * Client-side role check utilities (for UI components)
 * These should be used with useSession() hook
 */
export const roleUtils = {
  isAdmin: (role?: string) => role === "admin",
  isMember: (role?: string) => role === "member" || role === "admin",
  canCreate: (role?: string) => role === "admin",
  canEdit: (role?: string) => role === "admin",
  canDelete: (role?: string) => role === "admin",
  canViewAnalytics: (role?: string) => role === "admin",
  canManageGroups: (role?: string) => role === "admin",
};
