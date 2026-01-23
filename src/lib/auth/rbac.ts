import { auth } from "./auth";

export type UserRole = "admin" | "member" | "guest";
export type SubscriptionStatus = "free" | "paid" | "trial";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return session.user.role === role;
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

export async function isMember(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return session.user.role === "member" || session.user.role === "admin";
}

export async function hasPaidSubscription(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  if (session.user.role === "admin") return true;

  if (
    session.user.subscriptionStatus !== "paid" &&
    session.user.subscriptionStatus !== "trial"
  ) {
    return false;
  }

  if (session.user.subscriptionExpiresAt) {
    const expiresAt = new Date(session.user.subscriptionExpiresAt);
    return expiresAt > new Date();
  }

  return true;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requirePaidSubscription() {
  const user = await requireAuth();

  if (user.role === "admin") return user;

  if (
    user.subscriptionStatus !== "paid" &&
    user.subscriptionStatus !== "trial"
  ) {
    throw new Error("Paid subscription required");
  }

  if (user.subscriptionExpiresAt) {
    const expiresAt = new Date(user.subscriptionExpiresAt);
    if (expiresAt <= new Date()) {
      throw new Error("Subscription expired");
    }
  }

  return user;
}

export async function can(action: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const role = session.user.role;

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

export const roleUtils = {
  isAdmin: (role?: string) => role === "admin",
  isMember: (role?: string) => role === "member" || role === "admin",
  canCreate: (role?: string) => role === "admin",
  canEdit: (role?: string) => role === "admin",
  canDelete: (role?: string) => role === "admin",
  canViewAnalytics: (role?: string) => role === "admin",
  canManageGroups: (role?: string) => role === "admin",
};
