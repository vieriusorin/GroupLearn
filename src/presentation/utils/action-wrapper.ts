import { eq } from "drizzle-orm";
import { DomainError, ValidationError } from "@/domains/shared/errors";
import { users } from "@/infrastructure/database/schema/auth.schema";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { UserRole } from "@/lib/rbac";
import type { ActionResult } from "../types/action-result";

type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  subscriptionStatus: "free" | "paid" | "trial";
  subscriptionExpiresAt?: string | null;
};

const loadAuthUser = async (sessionUser: {
  id?: string;
  name?: string | null;
  email?: string | null;
}): Promise<AuthUser> => {
  const fallback: AuthUser = {
    id: sessionUser.id || "",
    name: sessionUser.name ?? null,
    email: sessionUser.email ?? null,
    role: "member",
    subscriptionStatus: "free",
    subscriptionExpiresAt: null,
  };

  if (!sessionUser.id) {
    return fallback;
  }

  const db = getDb();

  console.log(
    "[loadAuthUser] Searching for user with ID:",
    sessionUser.id,
    "Type:",
    typeof sessionUser.id,
  );

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      subscriptionStatus: users.subscriptionStatus,
      subscriptionExpiresAt: users.subscriptionExpiresAt,
    })
    .from(users)
    .where(eq(users.id, sessionUser.id));

  const row = rows[0];

  if (!row) {
    console.warn(
      "[loadAuthUser] User not found in database for ID:",
      sessionUser.id,
    );
    return fallback;
  }

  const dbRole = (row.role as UserRole | null) ?? "member";
  const dbSubStatus =
    (row.subscriptionStatus as "free" | "premium" | "trial" | null) ?? "free";

  const subscriptionStatus: "free" | "paid" | "trial" =
    dbSubStatus === "premium" ? "paid" : dbSubStatus;

  const loadedUser: AuthUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: dbRole,
    subscriptionStatus,
    subscriptionExpiresAt: row.subscriptionExpiresAt?.toISOString() ?? null,
  };

  console.log("[loadAuthUser] Found user in DB:", {
    id: loadedUser.id,
    email: loadedUser.email,
    role: loadedUser.role,
    roleFromDB: row.role,
  });

  return loadedUser;
};

/**
 * Wrapper for authenticated actions with role-based authorization
 * Note: Authentication is handled by proxy.ts, so we assume user is authenticated here
 * This wrapper focuses on role-based authorization for specific actions
 */
export async function withAuth<T>(
  allowedRoles: UserRole[],
  handler: (user: AuthUser) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    let session: Awaited<ReturnType<typeof auth>>;

    try {
      session = await auth();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[withAuth] Error calling auth():", errorMessage);

      if (errorMessage.includes("Base64")) {
        console.warn(
          "[withAuth] Detected corrupted session cookie. User should clear browser storage and sign in again.",
        );
      }

      return {
        success: false,
        error:
          "Authentication error. Please clear your browser cookies and sign in again.",
        code: "UNAUTHORIZED",
      };
    }

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to perform this action",
        code: "UNAUTHORIZED",
      };
    }

    const user = await loadAuthUser(session.user);

    console.log("[withAuth] Session user ID:", session.user.id);
    console.log("[withAuth] Loaded user:", {
      id: user.id,
      role: user.role,
      email: user.email,
    });
    console.log("[withAuth] Allowed roles:", allowedRoles);
    console.log(
      "[withAuth] User role in allowed roles?",
      allowedRoles.includes(user.role),
    );

    if (!allowedRoles.includes(user.role)) {
      console.error(
        "[withAuth] FORBIDDEN - User role:",
        user.role,
        "not in allowed roles:",
        allowedRoles,
      );
      return {
        success: false,
        error: "You do not have permission to perform this action",
        code: "FORBIDDEN",
      };
    }

    return await handler(user);
  } catch (error) {
    console.error("Server Action error:", error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        code: "VALIDATION_ERROR",
        validationErrors: error.errors,
      };
    }

    if (error instanceof DomainError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

export async function withOptionalAuth<T>(
  handler: (user: AuthUser | null) => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return await handler(null);
    }

    const user = await loadAuthUser(session.user);
    return await handler(user);
  } catch (error) {
    console.error("Server Action error:", error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        code: "VALIDATION_ERROR",
        validationErrors: error.errors,
      };
    }

    if (error instanceof DomainError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}

export async function withoutAuth<T>(
  handler: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await handler();
  } catch (error) {
    console.error("Server Action error:", error);

    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        code: "VALIDATION_ERROR",
        validationErrors: error.errors,
      };
    }

    if (error instanceof DomainError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    };
  }
}
