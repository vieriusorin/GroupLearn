import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/infrastructure/database/drizzle";
import { users } from "@/infrastructure/database/schema";
import { auth } from "@/lib/better-auth";
import type { UserRole } from "@/lib/rbac";

type AuthUser = {
  id: string;
  role: UserRole;
  email: string;
};

const loadUserWithRole = async (
  userId: string | undefined,
): Promise<AuthUser | null> => {
  if (!userId) {
    return null;
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: (row.role as UserRole | null) ?? "guest",
  };
};

const requiresAuth = (pathname: string): boolean => {
  const publicRoutes = ["/auth", "/api/auth", "/", "/invitations"];

  return !publicRoutes.some((route) => pathname.startsWith(route));
};

const requiresAdmin = (pathname: string): boolean => {
  return pathname.startsWith("/admin");
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (requiresAuth(pathname)) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const user = await loadUserWithRole(session.user.id);

    if (!user) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (requiresAdmin(pathname)) {
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-role", user.role);
    requestHeaders.set("x-user-email", user.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}
