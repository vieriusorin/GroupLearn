import { DomainError, ValidationError } from "@/domains/shared/errors";
import { queryHandlers } from "@/infrastructure/di/container";
import { auth } from "@/lib/auth/auth";
import type { UserRole } from "@/lib/auth/rbac";
import { getUserAuthDataQuery } from "@/queries/auth/GetUserAuthData.query";
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

  const query = getUserAuthDataQuery(sessionUser.id);
  const result = await queryHandlers.auth.getUserAuthData.execute(query);

  if (!result.user) {
    return fallback;
  }

  return {
    id: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
    subscriptionStatus: result.user.subscriptionStatus,
    subscriptionExpiresAt: result.user.subscriptionExpiresAt,
  };
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

    if (!allowedRoles.includes(user.role)) {
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
