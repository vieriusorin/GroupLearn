import { auth as getAuthSession } from "@/lib/auth/auth";
import type { AuthSession, AuthUser } from "./auth-types";

export const getServerSession = async (): Promise<AuthSession | null> => {
  const session = await getAuthSession();

  return session;
};

export const requireServerSession = async (): Promise<AuthSession> => {
  const session = await getServerSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const session = await getServerSession();

  return session?.user ?? null;
};

export const requireAdmin = async (): Promise<AuthUser> => {
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
};
